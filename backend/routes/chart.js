const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const axios = require('axios');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'empty_key'
});

// Chart generation endpoint
router.post('/', async (req, res) => {
  try {
    const { query, provider = 'openai' } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'No query provided' });
    }
    
    // System prompt that instructs the AI to generate chart data
    const systemPrompt = `You are a data visualization assistant. Analyze the user's query about charts and generate appropriate data for visualization.
    Return ONLY a JSON object with the following structure:
    {
      "chartType": "bar", 
      "title": "Chart title based on query",
      "explanation": "Brief explanation of what the chart shows",
      "data": [
        {"category": "Label1", "value": 42},
        {"category": "Label2", "value": 58}
        // etc...
      ],
      "options": {
        // Any chart configuration options
        "xKey": "category",
        "yKey": "value",
        "color": "#2CE4CF" // Optional custom color
      }
    }
    
    For medical-related queries, use realistic conditions and statistics.
    Include 4-8 data points depending on the query complexity.
    Make sure values make sense (e.g., percentages should sum to approximately 100%).
    DO NOT include any explanatory text outside the JSON structure.`;
    
    let chartJson;
    
    if (provider === 'openai') {
      // Create OpenAI request
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response to extract JSON
      const aiMessage = completion.choices[0].message.content;
      chartJson = JSON.parse(aiMessage);
    } else if (provider === 'claude') {
      // Claude API call via Anthropic
      const claudeResponse = await axios.post('https://api.anthropic.com/v1/complete', {
        prompt: `\n\nHuman: ${query}\n\nAssistant: ${systemPrompt}\n\n`,
        model: 'claude-2',
        max_tokens_to_sample: 1000,
        stop_sequences: ["\n\nHuman:"]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || 'empty_key'
        }
      });
      
      // Parse the response to extract JSON
      const claudeMessage = claudeResponse.data.completion;
      const jsonMatch = claudeMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        chartJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Claude response');
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }
    
    // Validate required fields
    if (!chartJson.chartType || !chartJson.data) {
      throw new Error('Chart data missing required fields');
    }
    
    // Add timestamp and query info
    chartJson.timestamp = new Date().toISOString();
    chartJson.query = query;
    
    return res.json({
      success: true,
      chartData: chartJson
    });
  } catch (error) {
    console.error('Error in chart generation endpoint:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 