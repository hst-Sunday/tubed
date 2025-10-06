"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Check, X, Link, FileText, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiPost } from "@/lib/http-client"
import { 
  getAllAcceptedTypes, 
  getFileIconComponent, 
  formatFileSize, 
  getSupportedFileTypesDescription,
  FILE_CATEGORIES
} from "@/lib/file-types"

interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  category: string
  uploadedAt?: string
}

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [copiedItem, setCopiedItem] = useState<{ fileId: string; format: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      
      // Add all files to FormData
      for (const file of Array.from(files)) {
        formData.append("files", file)
      }

      // Upload to server
      const response = await apiPost("/api/upload", formData)

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

  const getFullUrl = useCallback((relativeUrl: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${relativeUrl}`
    }
    return relativeUrl
  }, [])

  const copyToClipboard = useCallback(async (text: string, fileId: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem({ fileId, format })
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  const copyUrl = useCallback((file: UploadedFile) => {
    const fullUrl = getFullUrl(file.url)
    copyToClipboard(fullUrl, file.id, "url")
  }, [getFullUrl, copyToClipboard])

  const copyMarkdown = useCallback((file: UploadedFile) => {
    const fullUrl = getFullUrl(file.url)
    let markdown: string
    
    if (file.category === FILE_CATEGORIES.IMAGE) {
      markdown = `![${file.name}](${fullUrl})`
    } else {
      markdown = `[${file.name}](${fullUrl})`
    }
    
    copyToClipboard(markdown, file.id, "markdown")
  }, [getFullUrl, copyToClipboard])

  const copyHtml = useCallback((file: UploadedFile) => {
    const fullUrl = getFullUrl(file.url)
    let html: string
    
    if (file.category === FILE_CATEGORIES.IMAGE) {
      html = `<img src="${fullUrl}" alt="${file.name}" />`
    } else if (file.category === FILE_CATEGORIES.VIDEO) {
      html = `<video controls><source src="${fullUrl}" type="${file.type}">Your browser does not support the video tag.</video>`
    } else if (file.category === FILE_CATEGORIES.AUDIO) {
      html = `<audio controls><source src="${fullUrl}" type="${file.type}">Your browser does not support the audio tag.</audio>`
    } else {
      html = `<a href="${fullUrl}" download="${file.name}">${file.name}</a>`
    }
    
    copyToClipboard(html, file.id, "html")
  }, [getFullUrl, copyToClipboard])

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
          "relative border-[4px] border-dashed transition-all duration-300 cursor-pointer",
          isDragOver ? "border-primary bg-primary/10 scale-105" : "border-black",
          isUploading && "border-accent bg-accent/10",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <div className="p-12 text-center space-y-4 relative">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000000]">
            <Upload className="w-10 h-10 text-black" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
              拖拽文件到此处上传
            </h3>
            <p className="text-lg text-foreground font-bold">
              或者点击选择文件，支持 Ctrl+V 粘贴上传
            </p>
            <p className="text-sm text-muted-foreground font-semibold mt-2">
              支持：{getSupportedFileTypesDescription()}
            </p>
          </div>

          <Button
            variant="secondary"
            className="mt-4"
          >
            选择文件
          </Button>

          {isUploading && (
            <div className="absolute inset-0 bg-background/95 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-[4px] border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-accent font-extrabold text-xl uppercase">上传中...</p>
                <div className="w-48 h-3 bg-muted rounded-lg overflow-hidden border-[2px] border-black">
                  <div className="h-full bg-accent rounded-sm animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAllAcceptedTypes()}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-extrabold text-secondary uppercase">已上传文件</h3>

          <div className="grid gap-4">
            {uploadedFiles.map((file, index) => (
              <Card
                key={file.id}
                className="p-4 bg-secondary/20 hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_0px_#000000]">
                    {file.category === FILE_CATEGORIES.IMAGE ? (
                      <Image
                        src={file.url || "/placeholder.svg"}
                        alt={file.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (() => {
                        const IconComponent = getFileIconComponent({ name: file.name, type: file.type } as File)
                        return <IconComponent className="w-8 h-8 text-foreground" />
                      })()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{file.name}</p>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full shrink-0">
                        {file.category === FILE_CATEGORIES.IMAGE && '图片'}
                        {file.category === FILE_CATEGORIES.DOCUMENT && '文档'}
                        {file.category === FILE_CATEGORIES.PDF && 'PDF'}
                        {file.category === FILE_CATEGORIES.SPREADSHEET && '表格'}
                        {file.category === FILE_CATEGORIES.VIDEO && '视频'}
                        {file.category === FILE_CATEGORIES.AUDIO && '音频'}
                        {file.category === FILE_CATEGORIES.ARCHIVE && '压缩包'}
                        {file.category === FILE_CATEGORIES.CODE && '代码'}
                        {file.category === FILE_CATEGORIES.OTHER && '其他'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">{getFullUrl(file.url)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* URL Copy Button */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyUrl(file)}
                      className="px-2"
                      title="复制 URL"
                    >
                      {copiedItem?.fileId === file.id && copiedItem?.format === "url" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Link className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Markdown Copy Button */}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => copyMarkdown(file)}
                      className="px-2"
                      title="复制 Markdown"
                    >
                      {copiedItem?.fileId === file.id && copiedItem?.format === "markdown" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </Button>

                    {/* HTML Copy Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyHtml(file)}
                      className="px-2 bg-accent text-accent-foreground"
                      title="复制 HTML"
                    >
                      {copiedItem?.fileId === file.id && copiedItem?.format === "html" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Code className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFile(file.id)}
                      className="px-2"
                      title="删除文件"
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
