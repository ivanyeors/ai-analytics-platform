import requests
import psycopg2
import json
import time

# Function to fetch data from data.gov.sg API
def fetch_data():
    dataset_id = "d_bd55e8424376c557b5b05068e3ba56e9"
    url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}"
    response = requests.get(url)
    return response.json()

# Function to connect to PostgreSQL database
def connect_to_db():
    retries = 5
    while retries > 0:
        try:
            conn = psycopg2.connect(
                host="db",
                database="singapore_demographics",
                user="postgres",
                password="mysecretpassword"
            )
            print("Database connection established")
            return conn
        except psycopg2.OperationalError:
            retries -= 1
            print(f"Failed to connect to database. Retries left: {retries}")
            time.sleep(5)
    raise Exception("Could not connect to the database")

# Function to create table and store data
def store_data(conn, data):
    cursor = conn.cursor()
    
    # Create table for demographics data
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS demographics (
        id SERIAL PRIMARY KEY,
        category TEXT,
        total_population INTEGER,
        male_population INTEGER,
        female_population INTEGER,
        chinese_total INTEGER,
        malay_total INTEGER,
        indian_total INTEGER,
        others_total INTEGER
    )
    ''')
    
    # Parse and insert data
    records = data.get('result', {}).get('records', [])
    for record in records:
        try:
            cursor.execute('''
            INSERT INTO demographics (
                category, total_population, male_population, female_population,
                chinese_total, malay_total, indian_total, others_total
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                record.get('NumberText', ''),
                int(record.get('[Total] (Total) TotalNumeric', 0)),
                int(record.get('[Total] (Total) MalesNumeric', 0)),
                int(record.get('[Total] (Total) FemalesNumeric', 0)),
                int(record.get('[Chinese] (Total) TotalNumeric', 0)),
                int(record.get('[Malays] (Total) TotalNumeric', 0)),
                int(record.get('[Indians] (Total) TotalNumeric', 0)),
                int(record.get('[Others] (Total) TotalNumeric', 0))
            ))
        except (KeyError, ValueError) as e:
            print(f"Error processing record: {e}")
            continue
    
    # Commit changes
    conn.commit()
    print("Data has been stored in the database")

# Main function
def main():
    # Wait for database to be ready
    time.sleep(10)
    print("Fetching data from data.gov.sg...")
    data = fetch_data()
    print("Connecting to database...")
    conn = connect_to_db()
    print("Storing data in database...")
    store_data(conn, data)
    conn.close()
    print("Database initialization complete")

if __name__ == "__main__":
    main() 