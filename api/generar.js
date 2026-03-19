import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      referenceImageBase64,
      sourceImageBase64,
      title,
      contact,
      extra
    } = req.body;

    if (!referenceImageBase64) {
      return res.status(400).json({ error: "Falta la imagen de referencia" });
    }

    if (!sourceImageBase64) {
      return res.status(400).json({ error: "Falta la imagen a utilizar" });
    }

    if (!title) {
      return res.status(400).json({ error: "Falta el título" });
    }

    const commonPrompt = `
Create a professional social media advertising design.

There are two visual inputs in this request:
1. A reference image that defines the aesthetic direction, layout feel, and overall design language.
2. A source image that must be used as the main visual/product/photo in the final design.

Main title:
"${title}"

Contact information:
"${contact || "No contact info provided"}"

Extra instructions:
"${extra || "No extra instructions"}"

Important:
- Keep the final design visually inspired by the reference image.
- Use the source image as the main subject/content of the ad.
- Clean typography.
- Commercial, polished, premium social media look.
- No watermark.
`;

    const postPrompt = `
${commonPrompt}
Create a vertical Instagram feed post adapted to 1080x1350 proportion.
`;

    const storyPrompt = `
${commonPrompt}
Create a vertical Instagram story adapted to 1080x1920 proportion.
`;

    const [postResult, storyResult] = await Promise.all([
      openai.images.generate({
        model: "gpt-image-1",
        prompt: postPrompt,
        size: "1024x1536"
      }),
      openai.images.generate({
        model: "gpt-image-1",
        prompt: storyPrompt,
        size: "1024x1536"
      })
    ]);

    const postBase64 = postResult?.data?.[0]?.b64_json;
    const storyBase64 = storyResult?.data?.[0]?.b64_json;

    if (!postBase64 || !storyBase64) {
      return res.status(500).json({
        error: "OpenAI no devolvió ambas imágenes"
      });
    }

    return res.status(200).json({
      post: `data:image/png;base64,${postBase64}`,
      story: `data:image/png;base64,${storyBase64}`
    });
  } catch (error) {
    console.error("ERROR EN /api/generar:", error);

    return res.status(500).json({
      error: error?.message || "Error interno del servidor"
    });
  }
}