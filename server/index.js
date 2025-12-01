// Load environment variables from server/.env if present
try { require('dotenv').config({ path: __dirname + '/.env' }); } catch (e) { /* dotenv optional */ }

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('ShadowGuard proxy is running'));

// POST /api/chat
// body: { provider: 'openrouter'|'huggingface', model: string, messages: [{role,content}] } or { input: 'text' }
app.post('/api/chat', async (req, res) => {
  try {
    const provider = req.body.provider || 'huggingface';
    const model = req.body.model;
    const messages = req.body.messages || null;
    const input = req.body.input || null;

    // Support Hugging Face Router (OpenAI-compatible) at router.huggingface.co
    if (provider === 'hf_router') {
      const key = process.env.HF_TOKEN || process.env.HF_API_KEY;
      if (!key) return res.status(400).json({ error: 'Hugging Face Router token (HF_TOKEN) not configured on server.' });
      const url = 'https://router.huggingface.co/v1/chat/completions';
      const body = {
        model: model || process.env.HF_MODEL || 'facebook/blenderbot-400M-distill',
        messages: messages || (input ? [{ role: 'user', content: input }] : [])
      };
      const r = await axios.post(url, body, { headers: { Authorization: `Bearer ${key}` } });
      const data = r.data;
      if (data?.choices && data.choices[0]) {
        const ch = data.choices[0];
        const content = ch.message?.content || ch.text || null;
        return res.json({ text: content, raw: data });
      }
      return res.json({ text: JSON.stringify(data), raw: data });
    }

    if (provider === 'openrouter') {
      const key = process.env.OPENROUTER_KEY;
      if (!key) return res.status(400).json({ error: 'OpenRouter key not configured on server.' });
      const url = 'https://openrouter.ai/api/v1/chat/completions';
      const body = {
        model: model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
        messages: messages || (input ? [{ role: 'user', content: input }] : [])
      };
      const r = await axios.post(url, body, { headers: { Authorization: `Bearer ${key}` } });
      // return text if possible
      const data = r.data;
      if (data?.choices && data.choices[0]) {
        const ch = data.choices[0];
        const content = ch.message?.content || ch.text || null;
        return res.json({ text: content, raw: data });
      }
      return res.json({ text: JSON.stringify(data), raw: data });
    }

    // default: huggingface
    const hfKey = process.env.HF_API_KEY;
    if (!hfKey) return res.status(400).json({ error: 'Hugging Face key not configured on server.' });
    if (!model && !input) return res.status(400).json({ error: 'No model or input provided.' });

    const hfModel = model || process.env.HF_MODEL || 'facebook/blenderbot-400M-distill';
    const url = `https://api-inference.huggingface.co/models/${hfModel}`;

    // If messages provided, join into a single prompt (simple approach)
    let payload = { inputs: input || '' };
    if (messages && messages.length) {
      const conv = messages.map(m => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`)).join('\n') + (input ? `\nUser: ${input}` : '');
      payload = { inputs: conv };
    }

    const r = await axios.post(url, payload, { headers: { Authorization: `Bearer ${hfKey}` } });
    const data = r.data;
    if (Array.isArray(data) && data.length && data[0].generated_text) return res.json({ text: data[0].generated_text, raw: data });
    if (data && data.generated_text) return res.json({ text: data.generated_text, raw: data });
    return res.json({ text: JSON.stringify(data), raw: data });
  } catch (err) {
    console.error('Proxy error:', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Proxy request failed', details: err?.response?.data || err.message });
  }
});

// Image generation endpoint
// body: { provider: 'huggingface'|'together'|'openrouter', model: string, prompt: string }
app.post('/api/image', async (req, res) => {
  try {
    const provider = req.body.provider || 'huggingface';
    const model = req.body.model;
    const prompt = req.body.prompt;
    if (!model || !prompt) return res.status(400).json({ error: 'Model and prompt are required.' });

    if (provider === 'huggingface' || provider === 'together') {
      const key = process.env.HF_API_KEY;
      if (!key) return res.status(400).json({ error: 'Hugging Face API key not configured on server.' });
      const url = `https://api-inference.huggingface.co/models/${model}`;
      // Request image output; response may be binary image data
      const r = await axios.post(url, { inputs: prompt }, { headers: { Authorization: `Bearer ${key}` }, responseType: 'arraybuffer' });
      const ct = r.headers['content-type'] || 'image/png';
      const b64 = Buffer.from(r.data, 'binary').toString('base64');
      const dataUri = `data:${ct};base64,${b64}`;
      return res.json({ dataUri });
    }

    if (provider === 'openrouter') {
      const key = process.env.OPENROUTER_KEY;
      if (!key) return res.status(400).json({ error: 'OpenRouter key not configured on server.' });
      // OpenRouter may not support direct image models in the same way; attempt calling their endpoint
      const url = `https://openrouter.ai/api/v1/images/generations`;
      const body = { model: model, prompt };
      const r = await axios.post(url, body, { headers: { Authorization: `Bearer ${key}` } });
      // try to extract base64 image if returned
      if (r.data?.data && r.data.data[0]?.b64_json) {
        return res.json({ dataUri: `data:image/png;base64,${r.data.data[0].b64_json}` });
      }
      return res.status(500).json({ error: 'Unexpected image response', raw: r.data });
    }

    return res.status(400).json({ error: 'Unsupported provider for image generation.' });
  } catch (err) {
    console.error('Image generation error:', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Image generation failed', details: err?.response?.data || err.message });
  }
});

app.listen(PORT, () => console.log(`ShadowGuard proxy listening on http://localhost:${PORT}`));
