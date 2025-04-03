const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const axios = require('axios');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'empty_key'
});

// Regular chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, provider = 'openai' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }
    
    let response;
    
    if (provider === 'openai') {
      // OpenAI completion
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'gpt-3.5-turbo',
      });
      
      response = completion.choices[0].message.content;
    } else if (provider === 'claude') {
      // Claude API call via Anthropic
      const claudeResponse = await axios.post('https://api.anthropic.com/v1/complete', {
        prompt: `\n\nHuman: ${message}\n\nAssistant:`,
        model: 'claude-2',
        max_tokens_to_sample: 500,
        stop_sequences: ["\n\nHuman:"]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || 'empty_key'
        }
      });
      
      response = claudeResponse.data.completion;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }
    
    return res.json({ success: true, response });
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Streaming chat endpoint
router.post('/chat/stream', async (req, res) => {
  try {
    const { message, provider = 'openai' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    if (provider === 'openai') {
      // OpenAI streaming completion
      const stream = await openai.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'gpt-3.5-turbo',
        stream: true,
      });
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(content);
        }
      }
      
      res.end();
    } else if (provider === 'claude') {
      // Mock streaming for Claude since direct streaming isn't available in this example
      const claudeResponse = await axios.post('https://api.anthropic.com/v1/complete', {
        prompt: `\n\nHuman: ${message}\n\nAssistant:`,
        model: 'claude-2',
        max_tokens_to_sample: 500,
        stop_sequences: ["\n\nHuman:"]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || 'empty_key'
        }
      });
      
      const response = claudeResponse.data.completion;
      
      // Simulate streaming by sending chunks of the response
      const chunks = response.split(' ');
      for (const word of chunks) {
        res.write(word + ' ');
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      res.end();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }
  } catch (error) {
    console.error('Error in AI streaming chat endpoint:', error);
    res.write(`Error: ${error.message}`);
    res.end();
  }
});

module.exports = router; 