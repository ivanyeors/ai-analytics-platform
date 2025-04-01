const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Debug output to verify API key is being loaded
console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
console.log('API Key:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not found');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Track conversation history for better context
const conversations = {};

// Route to handle AI model interactions
router.post('/chat', async (req, res) => {
  console.log('Received AI chat request:', req.body);
  
  try {
    const { message, sessionId, conversationHistory } = req.body;
    
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
        { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations." },
        ...conversationHistory
      ];
    } else {
      // Initialize conversation history if it doesn't exist
      if (!conversations[sessionId]) {
        conversations[sessionId] = [
          { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations." }
        ];
      }
      
      // Add user message to conversation history
      conversations[sessionId].push({ role: "user", content: message });
      sessionMessages = conversations[sessionId];
    }
    
    console.log('Sending to OpenAI:', sessionMessages);
    
    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: sessionMessages,
    });
    
    console.log('OpenAI response received');
    
    // Add assistant response to conversation history if using server-side history
    const assistantMessage = completion.choices[0].message;
    if (!conversationHistory) {
      conversations[sessionId].push(assistantMessage);
    }
    
    const responseData = {
      success: true,
      response: assistantMessage.content
    };
    
    console.log('Sending response:', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('OpenAI API error details:', error.response.data);
      console.error('OpenAI API error status:', error.response.status);
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
    const { message, sessionId, conversationHistory } = req.body;
    
    if (!message) {
      res.write(JSON.stringify({ error: 'Message is required' }));
      res.end();
      return;
    }
    
    let sessionMessages;
    
    // Use provided conversation history if available, otherwise use stored history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      sessionMessages = [
        { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations." },
        ...conversationHistory
      ];
    } else {
      // Initialize conversation history if it doesn't exist
      if (!conversations[sessionId]) {
        conversations[sessionId] = [
          { role: "system", content: "You are a helpful analytics assistant that helps users understand data and visualizations." }
        ];
      }
      
      // Add user message to conversation history
      conversations[sessionId].push({ role: "user", content: message });
      sessionMessages = conversations[sessionId];
    }
    
    console.log('Streaming request to OpenAI...');
    
    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: sessionMessages,
      stream: true,
    });
    
    let fullResponse = '';
    
    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // Write each chunk directly to the response
        res.write(content);
        fullResponse += content;
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
    console.error('OpenAI streaming error:', error);
    
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

module.exports = router; 