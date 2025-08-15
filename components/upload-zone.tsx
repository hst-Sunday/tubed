"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, Copy, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt?: string
}

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      
      // Add all files to FormData
      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          formData.append("files", file)
        }
      }

      // Upload to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.files) {
        // Add uploaded files to the list
        setUploadedFiles((prev) => [...prev, ...result.files])
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      // You might want to show a toast or error message here
      alert(`上传失败: ${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (e.clipboardData?.files) {
        handleFiles(e.clipboardData.files)
      }
    },
    [handleFiles],
  )

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const copyToClipboard = useCallback(async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  // 监听全局粘贴事件
  React.useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-500 cursor-pointer holographic",
          "hover:neon-glow hover:scale-105 transform",
          isDragOver ? "pulse-border neon-glow scale-105" : "border-border",
          isUploading && "pulse-border",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <div className="p-12 text-center space-y-4 relative">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center neon-glow float">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-[var(--font-heading)] text-white drop-shadow-lg neon-text-bright tracking-wide">
              拖拽文件到此处上传
            </h3>
            <p className="text-lg text-gray-200 font-medium drop-shadow-md">或者点击选择文件，支持 Ctrl+V 粘贴上传</p>
          </div>

          <Button
            variant="outline"
            className="neon-glow-green border-secondary text-secondary hover:bg-secondary/20 bg-transparent hover:glitch transition-all duration-300"
          >
            选择文件
          </Button>

          {isUploading && (
            <div className="absolute inset-0 bg-background/90 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto neon-glow"></div>
                <p className="text-primary font-medium text-glow">上传中...</p>
                <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-[var(--font-heading)] text-secondary text-glow">已上传文件</h3>

          <div className="grid gap-4">
            {uploadedFiles.map((file, index) => (
              <Card
                key={file.id}
                className="p-4 neon-glow-green holographic hover:scale-102 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center neon-glow">
                    {file.type.startsWith("image/") ? (
                      <Image
                        src={file.url || "/placeholder.svg"}
                        alt={file.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground float" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-secondary font-mono break-all">{file.url}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.url, file.id)}
                      className="border-secondary text-secondary hover:bg-secondary/20 neon-glow-green hover:scale-110 transition-all duration-200"
                    >
                      {copiedId === file.id ? <Check className="w-4 h-4 text-glow" /> : <Copy className="w-4 h-4" />}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(file.id)}
                      className="border-destructive text-destructive hover:bg-destructive/20 hover:scale-110 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
