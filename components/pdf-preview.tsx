"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFPreviewProps {
  file: File
  className?: string
}

export function PDFPreview({ file, className }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [rotation, setRotation] = useState(0)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative border rounded-lg overflow-hidden bg-black/20">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="w-[600px] h-[800px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={600}
            rotate={rotation}
            loading={
              <div className="w-[600px] h-[800px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
              </div>
            }
          />
        </Document>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm">
          Page {pageNumber} of {numPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={() => setRotation((prev) => (prev + 90) % 360)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

