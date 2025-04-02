const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { default: Anthropic } = require('@anthropic-ai/sdk');

// Debug output to verify API keys are being loaded
console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not found');
console.log('Claude API Key available:', !!process.env.ANTHROPIC_API_KEY);
console.log('Claude Key:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'Not found');

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-if-not-set'
});

// Track conversation history for better context
const conversations = {};

// Helper function to get the appropriate AI client based on provider
const getAIClient = (provider = 'openai') => {
  if (provider === 'claude') {
    return { client: anthropic, type: 'claude' };
  }
  // Default to OpenAI
  return { client: openai, type: 'openai' };
};

// Route to handle AI model interactions
router.post('/chat', async (req, res) => {
  console.log('Received AI chat request:', req.body);
  
  try {
    const { message, sessionId, conversationHistory, provider = 'openai' } = req.body;
    console.log(`Using AI provider: ${provider}`);
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    let sessionMessages;
    
    // Use provided conversation history if available, otherwise use stored history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      sessionMessages = [
        { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations. Format your responses using markdown for better readability. Use headers, lists, code blocks, tables, and other markdown features as appropriate to make your responses more clear and structured." },
        ...conversationHistory
      ];
    } else {
      // Initialize conversation history if it doesn't exist
      if (!conversations[sessionId]) {
        conversations[sessionId] = [
          { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations. Format your responses using markdown for better readability. Use headers, lists, code blocks, tables, and other markdown features as appropriate to make your responses more clear and structured." }
        ];
      }
      
      // Add user message to conversation history
      conversations[sessionId].push({ role: "user", content: message });
      sessionMessages = conversations[sessionId];
    }
    
    const { client, type } = getAIClient(provider);
    console.log(`Sending to ${type}:`, sessionMessages);
    
    let responseContent = '';
    
    if (type === 'claude') {
      // Format messages for Claude API
      const systemMessage = sessionMessages.find(msg => msg.role === 'system')?.content || 
        "You are a helpful analytics assistant that helps users understand data and visualizations. Format your responses using markdown for better readability. Use headers, lists, code blocks, tables, and other markdown features as appropriate to make your responses more clear and structured.";
      
      const claudeMessages = sessionMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => {
          if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            return { role: 'assistant', content: msg.content };
          }
        });
      
      // Get response from Claude
      const claudeResponse = await client.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        system: systemMessage,
        messages: claudeMessages,
      });
      
      responseContent = claudeResponse.content[0].text;
      console.log('Claude response received');
    } else {
      // Get response from OpenAI
      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: sessionMessages,
      });
      
      console.log('OpenAI response received');
      responseContent = completion.choices[0].message.content;
    }
    
    // Add assistant response to conversation history if using server-side history
    if (!conversationHistory) {
      conversations[sessionId].push({
        role: "assistant",
        content: responseContent
      });
    }
    
    const responseData = {
      success: true,
      response: responseContent
    };
    
    console.log('Sending response:', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('AI API error:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('API error details:', error.response.data);
      console.error('API error status:', error.response.status);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Streaming version of the chat endpoint
router.post('/chat/stream', async (req, res) => {
  console.log('Received streaming AI chat request');
  
  // Set headers for streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  try {
    const { message, sessionId, conversationHistory, provider = 'openai' } = req.body;
    console.log(`Using AI provider for streaming: ${provider}`);
    
    if (!message) {
      res.write(JSON.stringify({ error: 'Message is required' }));
      res.end();
      return;
    }
    
    let sessionMessages;
    
    // Use provided conversation history if available, otherwise use stored history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      sessionMessages = [
        { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations. Format your responses using markdown for better readability. Use headers, lists, code blocks, tables, and other markdown features as appropriate to make your responses more clear and structured." },
        ...conversationHistory
      ];
    } else {
      // Initialize conversation history if it doesn't exist
      if (!conversations[sessionId]) {
        conversations[sessionId] = [
          { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations. Format your responses using markdown for better readability. Use headers, lists, code blocks, tables, and other markdown features as appropriate to make your responses more clear and structured." }
        ];
      }
      
      // Add user message to conversation history
      conversations[sessionId].push({ role: "user", content: message });
      sessionMessages = conversations[sessionId];
    }
    
    const { client, type } = getAIClient(provider);
    console.log(`Streaming request to ${type}...`);
    
    let fullResponse = '';
    
    if (type === 'claude') {
      // Format messages for Claude API
      const systemMessage = sessionMessages.find(msg => msg.role === 'system')?.content || 
        "You are a helpful analytics assistant that helps users understand data and visualizations. Format your responses using markdown for better readability. Use headers, lists, code blocks, tables, and other markdown features as appropriate to make your responses more clear and structured.";
      
      const claudeMessages = sessionMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => {
          if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            return { role: 'assistant', content: msg.content };
          }
        });
      
      // Create streaming completion with Claude
      try {
        const stream = await client.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          system: systemMessage,
          messages: claudeMessages,
          stream: true,
        });
        
        // Process the stream
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.text) {
            const content = chunk.delta.text;
            // Write each chunk directly to the response
            res.write(content);
            fullResponse += content;
          }
        }
      } catch (streamError) {
        console.error('Claude streaming error:', streamError);
        
        // If Claude streaming fails, fall back to non-streaming Claude response
        try {
          const claudeResponse = await client.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            system: systemMessage,
            messages: claudeMessages,
          });
          
          const content = claudeResponse.content[0].text;
          res.write(content);
          fullResponse = content;
        } catch (fallbackError) {
          throw new Error(`Claude API error: ${fallbackError.message}`);
        }
      }
    } else {
      // Create streaming completion with OpenAI
      const stream = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: sessionMessages,
        stream: true,
      });
      
      // Process the stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          // Write each chunk directly to the response
          res.write(content);
          fullResponse += content;
        }
      }
    }
    
    console.log('Stream completed');
    
    // Store the complete response in the conversation history
    if (!conversationHistory && sessionId) {
      conversations[sessionId].push({
        role: "assistant",
        content: fullResponse
      });
    }
    
    // Close the stream
    res.end();
    
  } catch (error) {
    console.error('AI streaming error:', error);
    
    // Try to send error response if connection is still open
    try {
      res.write(JSON.stringify({ error: error.message }));
      res.end();
    } catch (writeError) {
      console.error('Error sending error response:', writeError);
    }
  }
});

// Get conversation history for a session
router.get('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!conversations[sessionId]) {
    return res.json({
      success: true,
      history: []
    });
  }
  
  res.json({
    success: true,
    history: conversations[sessionId]
  });
});

// Clear conversation history for a session
router.delete('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (conversations[sessionId]) {
    delete conversations[sessionId];
  }
  
  res.json({
    success: true,
    message: 'Conversation history cleared'
  });
});

// Chart generation endpoint
router.post('/chart', async (req, res) => {
  console.log('Received chart generation request:', req.body);
  
  try {
    const { query, sessionId, provider = 'openai' } = req.body;
    console.log(`Using AI provider for chart: ${provider}`);
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    // System prompt that instructs the AI to generate chart data
    const systemPrompt = {
      role: "system", 
      content: `You are a data visualization assistant. Analyze the user's query about charts and generate appropriate data for visualization.
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
      DO NOT include any explanatory text outside the JSON structure.`
    };
    
    const { client, type } = getAIClient(provider);
    console.log(`Using ${type} for chart generation`);
    
    let chartJson;
    
    if (type === 'claude') {
      // Create Claude request
      const claudeResponse = await client.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1500,
        system: systemPrompt.content,
        messages: [
          { role: 'user', content: query }
        ]
      });
      
      // Parse the response to extract JSON
      const claudeMessage = claudeResponse.content[0].text;
      const jsonMatch = claudeMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        chartJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Claude response');
      }
    } else {
      // Create OpenAI request
      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          systemPrompt,
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response to extract JSON
      const aiMessage = completion.choices[0].message.content;
      chartJson = JSON.parse(aiMessage);
    }
    
    // Validate required fields
    if (!chartJson.chartType || !chartJson.data) {
      throw new Error('Chart data missing required fields');
    }
    
    // Add timestamp and query info
    chartJson.timestamp = new Date().toISOString();
    chartJson.query = query;
    
    console.log('Chart data generated successfully');
    
    res.json({
      success: true,
      chartData: chartJson
    });
    
  } catch (error) {
    console.error('AI chart generation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 