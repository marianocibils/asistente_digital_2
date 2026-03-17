import express from "express"
import OpenAI from "openai"

const app = express()

app.use(express.json())
app.use(express.static("."))

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post("/generar", async (req,res)=>{

 const {color,shape} = req.body

 const prompt = `simple ${color} ${shape} geometric shape`

 const result = await openai.images.generate({
   model:"gpt-image-1",
   prompt:prompt,
   size:"1024x1024"
 })

const image_base64 = result.data[0].b64_json;

const image_url = `data:image/png;base64,${image_base64}`;

res.json({
  image: image_url
});

})

app.listen(3000,()=>{
 console.log("Servidor en http://localhost:3000")
})