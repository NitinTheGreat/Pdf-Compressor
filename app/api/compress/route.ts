import type { NextRequest } from "next/server"
import { PDFDocument } from "pdf-lib"
import JSZip from "jszip"

export const maxDuration = 300 // 5 minutes max duration
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll("files") as File[]
  const targetSize = Number(formData.get("targetSize")) * 1024 * 1024 // Convert to bytes
  const password = formData.get("password") as string
  const preserveMetadata = formData.get("preserveMetadata") === "true"
  const asZip = formData.get("asZip") === "true"

  try {
    const compressedFiles: { name: string; data: Uint8Array }[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      if (password) {
        pdfDoc.encrypt({ userPassword: password, ownerPassword: password })
      }

      if (!preserveMetadata) {
        pdfDoc.setTitle("")
        pdfDoc.setAuthor("")
        pdfDoc.setSubject("")
        pdfDoc.setKeywords([])
        pdfDoc.setProducer("")
        pdfDoc.setCreator("")
      }

      // Compress PDF
      const compressedPdf = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        preserveExistingEncryption: false,
      })

      compressedFiles.push({
        name: file.name.replace(".pdf", "_compressed.pdf"),
        data: compressedPdf,
      })
    }

    if (asZip && compressedFiles.length > 1) {
      const zip = new JSZip()

      compressedFiles.forEach((file) => {
        zip.file(file.name, file.data)
      })

      const zipBuffer = await zip.generateAsync({ type: "uint8array" })

      return new Response(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="compressed_pdfs.zip"`,
        },
      })
    } else {
      // Return single file
      const file = compressedFiles[0]
      return new Response(file.data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${file.name}"`,
        },
      })
    }
  } catch (error) {
    console.error("Compression error:", error)
    return Response.json({ error: "Failed to compress PDF" }, { status: 500 })
  }
}

