import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { color, shape } = req.body;

    const prompt = `A simple ${color} ${shape} geometric shape, minimal design, centered, clean background`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const image_base64 = result.data[0].b64_json;
    const image_url = `data:image/png;base64,${image_base64}`;

    res.status(200).json({ image: image_url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo generar la imagen" });
  }
}