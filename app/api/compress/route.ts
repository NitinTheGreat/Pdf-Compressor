import type { NextRequest } from "next/server"
import { PDFDocument } from "pdf-lib"
import sharp from "sharp"
import { writeFile } from "fs/promises"
import { join } from "path"
import { connectDB, File } from "@/lib/db"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
})

export const maxDuration = 300 // 5 minutes
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 })
    }

    await connectDB()

    const formData = await req.formData()
    const files = formData.getAll("files") as File[]
    const targetSize = Number(formData.get("targetSize")) * 1024 * 1024 // Convert to bytes
    const password = formData.get("password") as string
    const preserveMetadata = formData.get("preserveMetadata") === "true"

    const compressedFiles = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Get all pages
      const pages = pdfDoc.getPages()

      // Compress each page's images
      for (const page of pages) {
        const { images } = await page.node.Resources().lookup()

        if (images) {
          for (const [name, image] of Object.entries(images)) {
            const imageData = await image.decode()
            const compressedImage = await sharp(imageData).jpeg({ quality: 80, progressive: true }).toBuffer()

            // Replace with compressed image
            page.node.Resources().images[name] = pdfDoc.embedJpg(compressedImage)
          }
        }
      }

      if (password) {
        await pdfDoc.encrypt({ userPassword: password, ownerPassword: password })
      }

      if (!preserveMetadata) {
        pdfDoc.setTitle("")
        pdfDoc.setAuthor("")
        pdfDoc.setSubject("")
        pdfDoc.setKeywords([])
        pdfDoc.setProducer("")
        pdfDoc.setCreator("")
      }

      const compressedPdf = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        preserveExistingEncryption: false,
      })

      // Save to disk temporarily
      const fileName = `${Date.now()}-${file.name}`
      const filePath = join(process.cwd(), "tmp", fileName)
      await writeFile(filePath, compressedPdf)

      // Save to database
      const fileDoc = await File.create({
        originalName: file.name,
        fileName,
        size: file.size,
        compressedSize: compressedPdf.length,
        path: filePath,
      })

      compressedFiles.push({
        id: fileDoc._id,
        name: file.name,
        originalSize: file.size,
        compressedSize: compressedPdf.length,
      })
    }

    return Response.json({ files: compressedFiles })
  } catch (error) {
    console.error("Compression error:", error)
    return Response.json({ error: "Failed to compress PDF" }, { status: 500 })
  }
}

