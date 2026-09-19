import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();

  // In AI Studio, the container reverse proxy strictly routes to port 3000.
  // When deployed to external platforms (Render, Railway, Heroku, VPS, Docker), bind to process.env.PORT or fallback to 3000.
  const isAiStudioContainer = Boolean(
    process.env.APP_URL && process.env.APP_URL !== 'http://localhost:3000' && process.env.APP_URL !== 'MY_APP_URL'
  ) || process.cwd().includes('/app/applet');
  const PORT = isAiStudioContainer ? 3000 : (Number(process.env.PORT) || 3000);

  // CORS support for mobile apps (Capacitor, Cordova, WebView) & cross-origin deployment
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Veda AI Study Server' });
  });

  // Check which API keys are available in server environment
  app.get('/api/veda/status', (_req, res) => {
    res.json({
      status: 'ok',
      hasServerGeminiKey: false, // Default env key is restricted (403); personal key recommended for Gemini
      hasServerGroqKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')),
      hasServerOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-or-')),
      recommendedAgent: 'groq',
      recommendedModel: 'openai/gpt-oss-120b',
    });
  });

  // 1. Google Gemini Endpoint
  app.post('/api/chat/gemini', async (req, res) => {
    const { apiKey, model = 'gemini-3.8-flash', prompt, conversationHistory = [] } = req.body;
    const apiKeyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!apiKeyToUse || apiKeyToUse === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        error: 'GEMINI_KEY_MISSING',
        message: 'Gemini API Key उपलब्ध नहीं है। कृपया Veda AI सेटिंग्स से अपनी Gemini API Key दर्ज करें, या Groq चुनें।',
      });
    }

    const contextPrefix = conversationHistory.length > 0
      ? conversationHistory.slice(-6).map((m: { role: string; content: string }) => `${m.role === 'user' ? 'छात्र (Student)' : 'Veda AI'}: ${m.content}`).join('\n\n') + '\n\n'
      : '';

    const fullPrompt = `${contextPrefix}छात्र का नया प्रश्न: ${prompt}`;

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
          systemInstruction: 'आप "Veda AI" (वेद AI) हैं - एक अत्यंत अनुभवी, उत्साहवर्धक और सहयोगी भारतीय स्टडी गुरु व प्रतियोगी परीक्षा कोच। छात्र के प्रश्नों का उत्तर स्पष्ट, सरल हिंदी और हिंग्लिश में दें। उत्तर को व्यवस्थित संरचना (बुलेट पॉइंट्स, मुख्य बिंदु, स्मृति सूत्र/ट्रिक्स और 📌 परीक्षा उपयोगी 1-लाइनर फैक्ट्स) में प्रस्तुत करें ताकि UPSC, SSC, रेलवे और राज्य स्तरीय परीक्षाओं की तैयारी में अधिकतम लाभ मिले।',
          temperature: 0.6,
        },
      });

      const reply = response.text || 'माफ़ करें, उत्तर प्राप्त नहीं हुआ।';
      return res.json({ reply });
    } catch (error: any) {
      const errorMsg = String(error?.message || error || '');
      const isDenied = errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('denied access') || errorMsg.includes('403');

      console.warn('Gemini notice:', isDenied ? 'Permission Denied 403 on key' : errorMsg.slice(0, 100));

      // Intelligent Server Fallback: If server Groq key is available and Gemini failed with 403, seamlessly answer using Groq 120B
      if (process.env.GROQ_API_KEY) {
        try {
          const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
            },
            body: JSON.stringify({
              model: 'openai/gpt-oss-120b',
              messages: [
                {
                  role: 'system',
                  content:
                    'आप "Veda AI" (वेद AI) हैं - एक अत्यंत अनुभवी, उत्साहवर्धक और सहयोगी भारतीय स्टडी गुरु व प्रतियोगी परीक्षा कोच। छात्र के प्रश्नों का उत्तर स्पष्ट, सरल हिंदी और हिंग्लिश में दें। उत्तर को व्यवस्थित संरचना (बुलेट पॉइंट्स, मुख्य बिंदु, स्मृति सूत्र/ट्रिक्स और 📌 परीक्षा उपयोगी 1-लाइनर फैक्ट्स) में प्रस्तुत करें ताकि UPSC, SSC, रेलवे और राज्य स्तरीय परीक्षाओं की तैयारी में अधिकतम लाभ मिले।',
                },
                { role: 'user', content: fullPrompt },
              ],
              temperature: 0.6,
              max_tokens: 1500,
            }),
          });

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            const fallbackReply = data.choices?.[0]?.message?.content;
            if (fallbackReply) {
              return res.json({
                reply: fallbackReply,
                agentUsed: 'Groq GPT-OSS 120B',
                note: 'Gemini अनुमति सीमा के कारण Groq हाई-स्पीड इंजन द्वारा संचालित',
              });
            }
          }
        } catch {
          // continue to structured error if groq fails
        }
      }

      return res.status(isDenied ? 403 : 500).json({
        error: isDenied ? 'GEMINI_PERMISSION_DENIED' : 'GEMINI_API_ERROR',
        message: isDenied
          ? 'आपके Google Cloud प्रोजेक्ट में Gemini API की अनुमति (403 Permission Denied) सीमित है। कृपया सेटिंग्स से अपनी व्यक्तिगत Gemini Key दर्ज करें या सीधे Groq AI चुनें।'
          : errorMsg,
      });
    }
  });

  // 2. Groq Endpoint (Proxied server-side to avoid CORS & network issues)
  app.post('/api/chat/groq', async (req, res) => {
    try {
      const { apiKey, model = 'openai/gpt-oss-120b', messages, temperature = 0.6, max_tokens = 1500 } = req.body;
      const keyToUse = apiKey || process.env.GROQ_API_KEY;

      if (!keyToUse || !keyToUse.trim()) {
        return res.status(400).json({
          error: 'GROQ_KEY_MISSING',
          message: 'Groq API Key अनुपलब्ध है। कृपया Veda AI सेटिंग्स से Groq API Key (gsk_...) दर्ज करें।',
        });
      }

      const systemPrompt = {
        role: 'system',
        content:
          'आप "Veda AI" (वेद AI) हैं - एक अत्यंत अनुभवी, उत्साहवर्धक और सहयोगी भारतीय स्टडी गुरु व प्रतियोगी परीक्षा कोच। छात्र के प्रश्नों का उत्तर स्पष्ट, सरल हिंदी और हिंग्लिश में दें। उत्तर को व्यवस्थित संरचना (बुलेट पॉइंट्स, मुख्य बिंदु, स्मृति सूत्र/ट्रिक्स और 📌 परीक्षा उपयोगी 1-लाइनर फैक्ट्स) में प्रस्तुत करें ताकि UPSC, SSC, रेलवे और राज्य स्तरीय परीक्षाओं की तैयारी में अधिकतम लाभ मिले।',
      };

      const finalMessages = [
        systemPrompt,
        ...(Array.isArray(messages) ? messages : []),
      ];

      // Primary call
      let groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse.trim()}`,
        },
        body: JSON.stringify({
          model: model || 'openai/gpt-oss-120b',
          messages: finalMessages,
          temperature,
          max_tokens,
        }),
      });

      // If model not found or restricted, gracefully retry with openai/gpt-oss-120b or qwen/qwen3.8-27b
      if (!groqResponse.ok) {
        const errJson = await groqResponse.json().catch(() => ({}));
        const msg = String(errJson?.error?.message || '');
        if (msg.includes('does not exist') || msg.includes('not have access') || msg.includes('decommissioned')) {
          groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${keyToUse.trim()}`,
            },
            body: JSON.stringify({
              model: 'openai/gpt-oss-120b',
              messages: finalMessages,
              temperature,
              max_tokens,
            }),
          });
        } else {
          return res.status(groqResponse.status).json({
            error: 'GROQ_API_ERROR',
            message: msg || `Groq सर्वर स्थिति कोड: ${groqResponse.status}`,
          });
        }
      }

      if (!groqResponse.ok) {
        const errJson = await groqResponse.json().catch(() => ({}));
        return res.status(groqResponse.status).json({
          error: 'GROQ_API_ERROR',
          message: errJson?.error?.message || `Groq स्थिति कोड: ${groqResponse.status}`,
        });
      }

      const data = await groqResponse.json();
      const reply = data.choices?.[0]?.message?.content || 'माफ़ करें, उत्तर प्राप्त नहीं हुआ।';
      return res.json({ reply });
    } catch (error: any) {
      console.warn('Groq server proxy warning:', error?.message || error);
      return res.status(500).json({
        error: 'GROQ_CONNECTION_FAILED',
        message: error?.message || 'Groq सर्वर से कनेक्शन स्थापित नहीं हो सका।',
      });
    }
  });

  // 3. OpenRouter / DeepSeek Endpoint
  app.post('/api/chat/openrouter', async (req, res) => {
    try {
      const { apiKey, model = 'deepseek/deepseek-chat', messages, temperature = 0.6, max_tokens = 1500 } = req.body;
      const keyToUse = apiKey || process.env.OPENROUTER_API_KEY;

      if (!keyToUse || !keyToUse.trim()) {
        return res.status(400).json({
          error: 'OPENROUTER_KEY_MISSING',
          message: 'OpenRouter API Key अनुपलब्ध है। कृपया Veda AI सेटिंग्स से OpenRouter API Key दर्ज करें।',
        });
      }

      const systemPrompt = {
        role: 'system',
        content:
          'आप "Veda AI" (वेद AI) हैं - एक अत्यंत अनुभवी, उत्साहवर्धक और सहयोगी भारतीय स्टडी गुरु व प्रतियोगी परीक्षा कोच। छात्र के प्रश्नों का उत्तर स्पष्ट, सरल हिंदी और हिंग्लिश में दें। उत्तर को व्यवस्थित संरचना (बुलेट पॉइंट्स, मुख्य बिंदु, स्मृति सूत्र/ट्रिक्स और 📌 परीक्षा उपयोगी 1-लाइनर फैक्ट्स) में प्रस्तुत करें ताकि UPSC, SSC, रेलवे और राज्य स्तरीय परीक्षाओं की तैयारी में अधिकतम लाभ मिले।',
      };

      const finalMessages = [
        systemPrompt,
        ...(Array.isArray(messages) ? messages : []),
      ];

      const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse.trim()}`,
          'HTTP-Referer': 'https://veda.studyhandler.internal',
          'X-Title': 'Veda AI Study Tutor',
        },
        body: JSON.stringify({
          model,
          messages: finalMessages,
          temperature,
          max_tokens,
        }),
      });

      if (!orResponse.ok) {
        const errJson = await orResponse.json().catch(() => ({}));
        const detailedMsg = errJson?.error?.message || `OpenRouter त्रुटि स्थिति: ${orResponse.status}`;
        return res.status(orResponse.status).json({
          error: 'OPENROUTER_API_ERROR',
          message: detailedMsg,
        });
      }

      const data = await orResponse.json();
      const reply = data.choices?.[0]?.message?.content || 'माफ़ करें, उत्तर प्राप्त नहीं हुआ।';
      return res.json({ reply });
    } catch (error: any) {
      console.error('OpenRouter server proxy error:', error);
      return res.status(500).json({
        error: 'OPENROUTER_CONNECTION_FAILED',
        message: error?.message || 'OpenRouter सर्वर से कनेक्शन स्थापित नहीं हो सका।',
      });
    }
  });

  // 4. Custom OpenAI-Compatible Endpoint (Ollama, Together, LM Studio, etc.)
  app.post('/api/chat/custom', async (req, res) => {
    try {
      const { baseUrl, apiKey, model, messages, temperature = 0.6, max_tokens = 1500 } = req.body;

      if (!baseUrl || !baseUrl.trim()) {
        return res.status(400).json({
          error: 'CUSTOM_BASE_URL_MISSING',
          message: 'कस्टम एजेंट के लिए Base URL आवश्यक है।',
        });
      }

      const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
      const targetEndpoint = cleanUrl.endsWith('/chat/completions')
        ? cleanUrl
        : `${cleanUrl}/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey && apiKey.trim()) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      }

      const systemPrompt = {
        role: 'system',
        content:
          'आप "Veda AI" (वेद AI) हैं - एक अत्यंत अनुभवी, उत्साहवर्धक और सहयोगी भारतीय स्टडी गुरु व प्रतियोगी परीक्षा कोच। छात्र के प्रश्नों का उत्तर स्पष्ट, सरल हिंदी और हिंग्लिश में दें। उत्तर को व्यवस्थित संरचना (बुलेट पॉइंट्स, मुख्य बिंदु, स्मृति सूत्र/ट्रिक्स और 📌 परीक्षा उपयोगी 1-लाइनर फैक्ट्स) में प्रस्तुत करें।',
      };

      const finalMessages = [
        systemPrompt,
        ...(Array.isArray(messages) ? messages : []),
      ];

      const customResponse = await fetch(targetEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'default',
          messages: finalMessages,
          temperature,
          max_tokens,
        }),
      });

      if (!customResponse.ok) {
        const errJson = await customResponse.json().catch(() => ({}));
        const detailedMsg = errJson?.error?.message || `कस्टम सर्वर त्रुटि कोड: ${customResponse.status}`;
        return res.status(customResponse.status).json({
          error: 'CUSTOM_API_ERROR',
          message: detailedMsg,
        });
      }

      const data = await customResponse.json();
      const reply = data.choices?.[0]?.message?.content || 'माफ़ करें, कोई उत्तर प्राप्त नहीं हुआ।';
      return res.json({ reply });
    } catch (error: any) {
      console.error('Custom agent proxy error:', error);
      return res.status(500).json({
        error: 'CUSTOM_CONNECTION_FAILED',
        message: error?.message || 'कस्टम AI एजेंट से कनेक्शन स्थापित नहीं हो सका। कृपया URL जांचें।',
      });
    }
  });

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Veda AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
