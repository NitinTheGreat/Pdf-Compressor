import type { NextRequest } from "next/server"
import { connectDB, File } from "@/lib/db"
import { readFile, unlink } from "fs/promises"
import JSZip from "jszip"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const file = await File.findById(params.id)
    if (!file) {
      return Response.json({ error: "File not found" }, { status: 404 })
    }

    const fileData = await readFile(file.path)

    // Delete file from disk and database
    await Promise.all([unlink(file.path), file.deleteOne()])

    return new Response(fileData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.originalName}"`,
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return Response.json({ error: "Failed to download file" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { fileIds } = await req.json()

    const files = await File.find({
      _id: { $in: fileIds },
    })

    if (files.length === 0) {
      return Response.json({ error: "No files found" }, { status: 404 })
    }

    const zip = new JSZip()

    // Add files to zip
    await Promise.all(
      files.map(async (file) => {
        const fileData = await readFile(file.path)
        zip.file(file.originalName, fileData)
      }),
    )

    // Generate zip
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    })

    // Delete files
    await Promise.all(
      files.map(async (file) => {
        await Promise.all([unlink(file.path), file.deleteOne()])
      }),
    )

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="compressed_pdfs.zip"',
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return Response.json({ error: "Failed to download files" }, { status: 500 })
  }
}

