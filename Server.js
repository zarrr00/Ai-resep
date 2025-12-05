import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "30mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/analyze", async (req, res) => {
  try {
    const base64Image = req.body.image.split(",")[1];

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
Kamu adalah Food AI Vision. Analisis makanan pada gambar.

Keluarkan hasil **HANYA dalam format JSON** seperti ini:

{
  "detected": ["Tomat", "Cabai", "Bawang"],
  "recipes": [
    {
      "name": "",
      "time": "",
      "difficulty": "",
      "servings": "",
      "description": "",
      "ingredients": [],
      "steps": [],
      "tips": ""
    }
  ]
}

Buatkan **2 resep masakan Indonesia** yang cocok dengan bahan tersebut.
JANGAN beri teks tambahan di luar JSON.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        }
      ]
    });

    const jsonResult = JSON.parse(result.response.text());

    res.json(jsonResult);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menganalisis gambar." });
  }
});

app.listen(3000, () => {
  console.log("Backend berjalan di http://localhost:3000");
});