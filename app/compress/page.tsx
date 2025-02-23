"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { File, RotateCw, Download, Archive, Settings, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface PDFFile extends File {
  preview?: string
  progress?: number
  compressed?: boolean
  compressedSize?: number
}

export default function CompressPage() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [targetSize, setTargetSize] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [isProtected, setIsProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [preserveMetadata, setPreserveMetadata] = useState(true)
  const [compressing, setCompressing] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > 3) {
        toast.error("Maximum 3 files allowed")
        return
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          progress: 0,
          compressed: false,
        }),
      )

      setFiles((prev) => [...prev, ...newFiles])
    },
    [files],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 3,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview!)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const compressFiles = async () => {
    setCompressing(true)
    // Simulate compression
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      for (let progress = 0; progress <= 100; progress += 10) {
        setFiles((prev) => {
          const newFiles = [...prev]
          newFiles[i] = { ...file, progress }
          return newFiles
        })
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
      setFiles((prev) => {
        const newFiles = [...prev]
        newFiles[i] = {
          ...file,
          compressed: true,
          compressedSize: file.size * 0.6,
        }
        return newFiles
      })
    }
    setCompressing(false)
    toast.success("Compression complete!")
  }

  const downloadAll = () => {
    toast.success("Downloading all files as ZIP")
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload and Controls */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Upload PDFs</CardTitle>
                <CardDescription className="text-white/60">Drop up to 3 PDF files or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20"}`}
                >
                  <input {...getInputProps()} />
                  <File className="w-12 h-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white/60">
                    {isDragActive ? "Drop the files here..." : "Drag & drop PDF files here, or click to select"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Compression Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Target Size (MB): {targetSize}MB</Label>
                  <Slider
                    value={[targetSize]}
                    onValueChange={([value]) => setTargetSize(value)}
                    min={0.1}
                    max={10}
                    step={0.1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Password Protection</Label>
                  <Switch checked={isProtected} onCheckedChange={setIsProtected} />
                </div>

                {isProtected && (
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Preserve Metadata</Label>
                  <Switch checked={preserveMetadata} onCheckedChange={setPreserveMetadata} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview and Files */}
          <div className="space-y-6">
            {files.map((file, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate">{file.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-white/60">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                    {file.compressed && ` → ${(file.compressedSize! / 1024 / 1024).toFixed(2)}MB`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {file.compressed ? (
                    <div className="flex justify-center space-x-2">
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <Progress value={file.progress} className="w-full" />
                  )}
                </CardContent>
              </Card>
            ))}

            {files.length > 0 && (
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={compressFiles}
                  disabled={compressing}
                  className="bg-gradient-to-r from-indigo-500 to-rose-500"
                >
                  {compressing ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Compress All
                    </>
                  )}
                </Button>
                {files.some((f) => f.compressed) && (
                  <Button onClick={downloadAll} variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Download All (ZIP)
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

