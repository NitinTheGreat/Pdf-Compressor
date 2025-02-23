"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRive } from "@rive-app/react-canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PDFPreview } from "@/components/pdf-preview"
import { Download, X, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompressionCardProps {
  file: File
  onRemove: () => void
  onDownload: () => void
  progress: number
  compressed: boolean
  compressedSize?: number
}

export function CompressionCard({
  file,
  onRemove,
  onDownload,
  progress,
  compressed,
  compressedSize,
}: CompressionCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  const { RiveComponent } = useRive({
    src: "/animations/success.riv",
    autoplay: true,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">{file.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original: {(file.size / 1024 / 1024).toFixed(2)}MB</span>
              {compressed && compressedSize && (
                <span className="text-muted-foreground">Compressed: {(compressedSize / 1024 / 1024).toFixed(2)}MB</span>
              )}
            </div>

            {!compressed ? (
              <Progress value={progress} className="h-2" />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
                <Button
                  size="sm"
                  onClick={onDownload}
                  className={cn(
                    "bg-gradient-to-r",
                    "from-primary to-accent",
                    "hover:from-primary/90 hover:to-accent/90",
                  )}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <PDFPreview file={file} className="mt-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

