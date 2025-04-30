// This script generates PNG icons from the SVG icon
// Run with: npx tsx scripts/generate-icons.tsx

import fs from "fs"
import path from "path"
import { createCanvas, loadImage } from "canvas"

async function generateIcons() {
  const sizes = [192, 512]
  const svgPath = path.join(process.cwd(), "public", "icon.svg")

  // Read SVG content
  const svgContent = fs.readFileSync(svgPath, "utf8")

  // Create a data URL from the SVG content
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`

  // Load the SVG image
  const image = await loadImage(svgDataUrl)

  // Generate icons for each size
  for (const size of sizes) {
    // Create a canvas with the desired size
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext("2d")

    // Draw the SVG image on the canvas
    ctx.drawImage(image, 0, 0, size, size)

    // Convert the canvas to a PNG buffer
    const buffer = canvas.toBuffer("image/png")

    // Save the PNG file
    fs.writeFileSync(path.join(process.cwd(), "public", `icon-${size}.png`), buffer)

    // Also save as maskable icon
    fs.writeFileSync(path.join(process.cwd(), "public", `icon-maskable-${size}.png`), buffer)
  }

  console.log("Icons generated successfully!")
}

generateIcons().catch(console.error)
