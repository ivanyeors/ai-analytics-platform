use spacetimedb::{spacetimedb, Identity, Reducer, ReducerContext, SpacetimeType, Timestamp};

// Define data schema

#[spacetimedb(table)]
pub struct DataPoint {
    #[primarykey]
    pub id: u64,
    pub timestamp: Timestamp,
    pub category: String,
    pub value: f64,
}

#[spacetimedb(table)]
pub struct Category {
    #[primarykey]
    pub name: String,
    pub description: String,
    pub color: String,
}

// Reducers - functions that modify the database

#[spacetimedb(reducer)]
pub fn add_data_point(ctx: ReducerContext, category: String, value: f64) -> u64 {
    // Ensure category exists
    if Category::filter_by_name(&category).is_none() {
        // Create a default category if it doesn't exist
        add_category(
            ctx.clone(),
            category.clone(),
            format!("Auto-created category for {}", category),
            "#1f77b4".to_string(),
        );
    }
    
    // Generate a unique ID
    let id = ctx.random_u64();
    
    // Insert the data point
    DataPoint::insert(DataPoint {
        id,
        timestamp: ctx.timestamp(),
        category,
        value,
    });
    
    id
}

#[spacetimedb(reducer)]
pub fn add_category(ctx: ReducerContext, name: String, description: String, color: String) {
    // Insert or update the category
    if let Some(mut existing) = Category::filter_by_name(&name) {
        existing.description = description;
        existing.color = color;
        existing.update();
    } else {
        Category::insert(Category {
            name,
            description,
            color,
        });
    }
}

#[spacetimedb(reducer)]
pub fn update_data_point(ctx: ReducerContext, id: u64, category: Option<String>, value: Option<f64>) -> bool {
    if let Some(mut data_point) = DataPoint::filter_by_id(&id) {
        // Update category if provided
        if let Some(new_category) = category {
            // Ensure the new category exists
            if Category::filter_by_name(&new_category).is_none() {
                add_category(
                    ctx.clone(),
                    new_category.clone(),
                    format!("Auto-created category for {}", new_category),
                    "#1f77b4".to_string(),
                );
            }
            data_point.category = new_category;
        }
        
        // Update value if provided
        if let Some(new_value) = value {
            data_point.value = new_value;
        }
        
        // Save the changes
        data_point.update();
        true
    } else {
        false
    }
}

#[spacetimedb(reducer)]
pub fn delete_data_point(ctx: ReducerContext, id: u64) -> bool {
    if let Some(data_point) = DataPoint::filter_by_id(&id) {
        data_point.delete();
        true
    } else {
        false
    }
}

#[spacetimedb(reducer)]
pub fn delete_category(ctx: ReducerContext, name: String, reassign_to: Option<String>) -> bool {
    if let Some(category) = Category::filter_by_name(&name) {
        // If reassignment category is provided, update all data points
        if let Some(new_category) = reassign_to {
            // Ensure the new category exists
            if Category::filter_by_name(&new_category).is_none() {
                add_category(
                    ctx.clone(),
                    new_category.clone(),
                    format!("Auto-created category for {}", new_category),
                    "#1f77b4".to_string(),
                );
            }
            
            // Reassign all data points to the new category
            for mut data_point in DataPoint::iter().filter(|dp| dp.category == name) {
                data_point.category = new_category.clone();
                data_point.update();
            }
        } else {
            // Delete all data points in this category if no reassignment
            for data_point in DataPoint::iter().filter(|dp| dp.category == name) {
                data_point.delete();
            }
        }
        
        // Delete the category
        category.delete();
        true
    } else {
        false
    }
}

// Utility reducer to generate sample data
#[spacetimedb(reducer)]
pub fn generate_sample_data(ctx: ReducerContext, num_points: u32) {
    // Create some default categories if empty
    let categories = ["Revenue", "Users", "Engagement", "Conversion"];
    let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];
    
    // Add categories if they don't exist
    for (i, &category) in categories.iter().enumerate() {
        if Category::filter_by_name(category).is_none() {
            add_category(
                ctx.clone(),
                category.to_string(),
                format!("Sample data for {}", category),
                colors[i].to_string(),
            );
        }
    }
    
    // Generate random data points
    for _ in 0..num_points {
        // Select a random category
        let category_idx = (ctx.random_u64() % categories.len() as u64) as usize;
        let category = categories[category_idx].to_string();
        
        // Generate a random value between 0 and 100
        let value = (ctx.random_u64() % 10000) as f64 / 100.0;
        
        // Add the data point
        add_data_point(ctx.clone(), category, value);
    }
} 