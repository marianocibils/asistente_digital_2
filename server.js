import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generar", async (req, res) => {
  try {
    const { color, shape } = req.body;

    const prompt = `simple ${color} ${shape} geometric shape`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    const image_base64 = result.data[0].b64_json;
    const image_url = `data:image/png;base64,${image_base64}`;

    res.json({ image: image_url });
  } catch (error) {
    console.error("Error al generar imagen:", error);
    res.status(500).json({ error: "No se pudo generar la imagen" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor en puerto ${PORT}`);
});