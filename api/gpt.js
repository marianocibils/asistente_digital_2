import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { color, shape } = req.body;

    if (!color || !shape) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const prompt = `A simple ${color} ${shape} geometric shape, minimal design, centered, clean background`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    console.log("RESULTADO OPENAI:", result);

    const image_base64 = result?.data?.[0]?.b64_json;

    if (!image_base64) {
      return res.status(500).json({
        error: "OpenAI no devolvió imagen",
        debug: result
      });
    }

    res.status(200).json({
      image: `data:image/png;base64,${image_base64}`
    });

  } catch (error) {
    console.error("ERROR BACKEND:", error);

    res.status(500).json({
      error: error.message || "Error desconocido"
    });
  }
}