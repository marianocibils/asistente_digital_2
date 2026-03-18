import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { texto } = JSON.parse(req.body);

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: texto,
    });

    res.status(200).json({
      resultado: response.output[0].content[0].text,
    });

  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
}