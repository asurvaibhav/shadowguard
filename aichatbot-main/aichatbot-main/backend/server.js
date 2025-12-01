import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Streaming endpoint
app.post("/api/chat-stream", async (req, res) => {
try {
const { message } = req.body;
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");
const stream = await openai.chat.completions.create({
model: "gpt-4o-mini",
messages: [{ role: "user", content: message }],
stream: true,
});
for await (const chunk of stream) {
const content = chunk.choices[0]?.delta?.content || "";
if (content) res.write(content);
}
res.end();
} catch (error) {
res.status(500).json({ error: error.message });
}
});
app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));  

