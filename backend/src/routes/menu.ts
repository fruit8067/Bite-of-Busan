import { Router } from "express";
import { scanMenuImage } from "../services/menuScan";

function stripDataUrlPrefix(imageBase64: string): string {
  const commaIndex = imageBase64.indexOf(",");
  return imageBase64.startsWith("data:") && commaIndex !== -1
    ? imageBase64.slice(commaIndex + 1)
    : imageBase64;
}

export const menuRouter = Router();

menuRouter.post("/scan", async (req, res) => {
  const { imageBase64, imageUrl } = req.body ?? {};

  if (typeof imageUrl === "string" && imageUrl.length > 0) {
    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== "https:") {
        return res.status(400).json({ error: "imageUrl must use https" });
      }
    } catch {
      return res.status(400).json({ error: "imageUrl must be a valid URL" });
    }
  } else if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const result = await scanMenuImage(
      imageUrl
        ? { imageUrl }
        : { imageBase64: stripDataUrlPrefix(imageBase64) }
    );
    return res.json({
      restaurantName: result.restaurantName,
      items: result.items.map((item, index) => ({ id: index, ...item })),
    });
  } catch (err) {
    console.error("[menu/scan] failed:", err);
    return res.status(502).json({ error: "menu scan failed" });
  }
});
