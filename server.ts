import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 50, // Limit each IP to 50 requests per `window`
	message: "Too many requests, please try again later.",
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.set('trust proxy', 1);
  app.use(express.json());

  // API routes
  app.post("/api/gemini/chat", limiter, async (req, res) => {
    try {
      const { message } = req.body;
      
      // Basic input validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: "Invalid message format" });
      }
      if (message.length > 2000) {
        return res.status(400).json({ error: "Message is too long" });
      }
      
      const generateWithRetry = async (prompt: string, retries = 3): Promise<any> => {
        try {
          return await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
          });
        } catch (error: any) {
          if (error.status === 503 && retries > 0) {
            const delay = (4 - retries) * 2000; // Exponential backoff: 2s, 4s, 6s
            console.warn(`Gemini 503 error, retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(prompt, retries - 1);
          }
          if (error.status === 429) {
             throw new Error("QUOTA_EXCEEDED");
          }
          throw error;
        }
      };

      const response = await generateWithRetry(message);
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.message === "QUOTA_EXCEEDED") {
          return res.status(429).json({ error: "Daily quota exceeded. Please try again tomorrow." });
      }
      res.status(500).json({ error: "Failed to generate response due to high demand. Please try again." });
    }
  });

  app.post("/api/parse-to-quiz", limiter, async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: "Invalid text input" });
      }

      const prompt = `Convert the following text into a structured JSON array of quiz questions.

      Follow these strict rules:
      1. Analyze the provided text to extract questions, options, answers, and explanations.
      2. The output MUST be a valid JSON array of objects.
      3. For each object, infer the "type" based on the question structure (use "mcq" if options are provided).
      4. Ensure all required fields (id, type, question, answer, points) are present.
      5. If options are not explicitly provided for an mcq, generate reasonable ones.
      
      The schema for each object MUST be:
      {
        "id": number,
        "type": "mcq" | "true_false" | "fill_in_blank" | "short_answer" | "matching" | "sorting",
        "question": string,
        "options": string[],
        "answer": string,
        "explanation": string,
        "points": number
      }
      
      Text to parse:
      ${text}
      
      Return ONLY the raw JSON array. Do not include any other text, markdown formatting, or explanations.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json(JSON.parse(response.text || '[]'));
    } catch (error) {
      console.error("Quiz parsing error:", error);
      res.status(500).json({ error: "Failed to parse text into a quiz." });
    }
  });

  app.post("/api/parse-to-flashcards", limiter, async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: "Invalid text input" });
      }

      const prompt = `Convert the following text into a structured JSON array of flashcards.
      The output MUST be a JSON array of objects conforming to this schema:
      {
        "id": number,
        "front": string,
        "back": string
      }
      
      Text to parse:
      ${text}
      
      Return ONLY the JSON array.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json(JSON.parse(response.text || '[]'));
    } catch (error) {
      console.error("Flashcard parsing error:", error);
      res.status(500).json({ error: "Failed to parse text into flashcards." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
