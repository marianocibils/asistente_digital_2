import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function fileToDataURI(filePath, mimeType = "image/png") {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

router.post("/generar", upload.single("referenceImage"), async (req, res) => {
  let tempPath = null;

  try {
    const { title, contact, extra } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Falta la imagen de referencia" });
    }

    if (!title) {
      return res.status(400).json({ error: "Falta el título" });
    }

    tempPath = file.path;

    const mimeType = file.mimetype || "image/png";
    const referenceDataURI = fileToDataURI(tempPath, mimeType);

    const commonText = `
Usar la imagen de referencia como base visual.
Mantener la esencia estética, producto, estilo, composición y lenguaje visual de la referencia.
Diseñar una pieza publicitaria profesional para redes sociales.
Incluir de forma clara y bien integrada este título:
"${title}"

Incluir esta información de contacto de manera prolija y legible:
"${contact || "Sin contacto adicional"}"

Indicaciones extra:
"${extra || "Sin indicaciones extra"}"

No agregar marcas de agua.
Texto bien compuesto, diseño realista, limpio, publicitario y profesional.
`;

    // 1080 x 1350
    const postPrompt = `
${commonText}
Crear versión para feed vertical 4:5.
Composición optimizada para Instagram post.
Dimensión objetivo: 1080x1350 px.
`;

    // 1080 x 1920
    const storyPrompt = `
${commonText}
Crear versión para story vertical.
Composición adaptada o equivalente para pantalla completa.
Dimensión objetivo: 1080x1920 px.
`;

    // Según la implementación/documentación vigente, las imágenes pueden enviarse como data URI/base64. :contentReference[oaicite:1]{index=1}
    const [postResult, storyResult] = await Promise.all([
      openai.images.generate({
        model: "gpt-image-1",
        prompt: postPrompt,
        size: "1024x1536"
      }),
      openai.images.generate({
        model: "gpt-image-1",
        prompt: storyPrompt,
        size: "1024x1792"
      })
    ]);

    const postBase64 = postResult?.data?.[0]?.b64_json;
    const storyBase64 = storyResult?.data?.[0]?.b64_json;

    if (!postBase64 || !storyBase64) {
      return res.status(500).json({
        error: "No se pudieron generar ambas imágenes"
      });
    }

    return res.status(200).json({
      post: `data:image/png;base64,${postBase64}`,
      story: `data:image/png;base64,${storyBase64}`
    });
  } catch (error) {
    console.error("ERROR GENERANDO:", error);
    return res.status(500).json({
      error: error?.message || "Error desconocido"
    });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
});

export default router;