"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { apiDelete } from "@/lib/http-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileRecord } from "@/lib/database"
import { FILE_TYPE_CONFIGS, formatFileSize } from "@/lib/file-types"
import { ExternalLink, Trash2, ImageIcon, ZoomIn, X } from "lucide-react"
import { toast } from "sonner"

interface FileCardProps {
  file: FileRecord
  onDelete?: (id: string) => void
  selectionMode?: boolean
  isSelected?: boolean
  onSelectionChange?: (fileId: string, selected: boolean) => void
}

export function FileCard({ 
  file, 
  onDelete, 
  selectionMode = false, 
  isSelected = false, 
  onSelectionChange 
}: FileCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  const config = FILE_TYPE_CONFIGS[file.category] || FILE_TYPE_CONFIGS.other
  const IconComponent = config.icon

  const isImage = file.category === 'image'

  const handleImageClick = () => {
    if (selectionMode) {
      handleSelectionToggle()
    } else if (isImage && imageLoaded && !imageError) {
      setIsImageViewerOpen(true)
    }
  }

  const handleSelectionToggle = () => {
    if (onSelectionChange) {
      onSelectionChange(file.id, !isSelected)
    }
  }

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageViewerOpen) {
        setIsImageViewerOpen(false)
      }
    }

    if (isImageViewerOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 防止页面滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isImageViewerOpen])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await apiDelete(`/api/files/${file.id}`)

      if (response.ok) {
        toast.success('文件删除成功')
        onDelete?.(file.id)
        setIsDeleteDialogOpen(false)
      } else {
        toast.error('删除失败')
      }
    } catch {
      toast.error('删除失败')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image': return 'text-blue-400'
      case 'video': return 'text-purple-400'
      case 'audio': return 'text-green-400'
      case 'document': return 'text-yellow-400'
      case 'code': return 'text-pink-400'
      case 'archive': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'image': return 'border-blue-400/50 text-blue-400'
      case 'video': return 'border-purple-400/50 text-purple-400'
      case 'audio': return 'border-green-400/50 text-green-400'
      case 'document': return 'border-yellow-400/50 text-yellow-400'
      case 'code': return 'border-pink-400/50 text-pink-400'
      case 'archive': return 'border-orange-400/50 text-orange-400'
      default: return 'border-gray-400/50 text-gray-400'
    }
  }

  const PreviewSection = () => {
    if (isImage) {
      return (
        <div
          className={`relative w-full h-48 bg-background/50 rounded-lg overflow-hidden group-hover:bg-background/70 transition-colors ${
            selectionMode ? 'cursor-pointer' : (imageLoaded && !imageError ? 'cursor-pointer' : '')
          }`}
          onClick={handleImageClick}
        >
          {/* 选择模式复选框 */}
          {selectionMode && (
            <div className="absolute top-2 left-2 z-20">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleSelectionToggle()}
                className="w-5 h-5 border-2 border-cyan-400 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
              />
            </div>
          )}
          {!imageError ? (
            <>
              <Image
                src={file.url}
                alt={file.name}
                fill
                className={`object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 24vw, 20vw"
                loading="lazy"
                unoptimized
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">预览失败</p>
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="text-cyan-400 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="truncate">{file.name}</span>
                  </div>
                </div>
                {imageLoaded && !imageError && (
                  <ZoomIn className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 非图片文件显示图标
    return (
      <div 
        className={`relative w-full h-48 bg-background/50 rounded-lg overflow-hidden flex flex-col items-center justify-center space-y-3 ${
          selectionMode ? 'cursor-pointer' : ''
        }`}
        onClick={selectionMode ? handleSelectionToggle : undefined}
      >
        {/* 选择模式复选框 */}
        {selectionMode && (
          <div className="absolute top-2 left-2 z-20">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectionToggle()}
              className="w-5 h-5 border-2 border-cyan-400 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"
            />
          </div>
        )}
        <div className={`w-16 h-16 rounded-xl bg-background/80 flex items-center justify-center ${getCategoryColor(file.category)} float`}>
          <IconComponent className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground truncate max-w-full px-2">{file.name}</p>
          <Badge variant="outline" className={`text-xs mt-1 ${getCategoryBadgeColor(file.category)}`}>
            {file.category}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className={`overflow-hidden neon-glow holographic hover:scale-105 transition-all duration-300 group py-0 ${
        isSelected ? 'ring-2 ring-cyan-400 bg-cyan-400/10' : ''
      }`}>
        {/* 预览区域 */}
        <PreviewSection />

        {/* 信息和操作区域 */}
        <div className="p-4 space-y-3">
          {/* 文件信息 - 只在非图片时显示详细信息 */}
          {!isImage && (
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>大小</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span>上传时间</span>
                <span>{formatDate(file.uploadedAt)}</span>
              </div>
            </div>
          )}

          {/* 图片文件显示简化信息 */}
          {isImage && (
            <div className="text-center">
              <h3 className="text-sm font-medium text-foreground truncate" title={file.name}>
                {file.name}
              </h3>
              <div className="flex justify-center space-x-4 text-xs text-muted-foreground mt-1">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.uploadedAt)}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-2 transition-opacity duration-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(file.url, '_blank')}
              className="flex-1 neon-glow-green text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              查看
            </Button>
            {/* <Button
              size="sm"
              variant="outline"
              onClick={handleCopyUrl}
              className="flex-1 neon-glow-blue text-xs"
              disabled={copied === 'url'}
            >
              {copied === 'url' ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied === 'url' ? '已复制' : '链接'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyMarkdown}
              className="flex-1 neon-glow-yellow text-xs"
              disabled={copied === 'markdown'}
            >
              {copied === 'markdown' ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied === 'markdown' ? '已复制' : 'MD'}
            </Button> */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="neon-glow-red text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 图片灯箱 */}
      {isImage && (
        <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-background/95 backdrop-blur-md neon-glow holographic border-primary/50">
            <DialogHeader className="sr-only">
              <DialogTitle>图片预览 - {file.name}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsImageViewerOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors neon-glow-red"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 图片显示区域 */}
              <div className="relative max-w-[85vw] max-h-[85vh] min-h-[200px] flex items-center justify-center">
                {!imageError ? (
                  <div className="relative">
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={1200}
                      height={800}
                      className="max-w-full max-h-[85vh] min-h-[280px] w-auto h-auto object-contain rounded-lg"
                      priority
                      sizes="90vw"
                      unoptimized
                    />

                    {/* 图片信息覆盖层 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                      <h3 className="text-white font-medium text-lg mb-1">{file.name}</h3>
                      <div className="flex space-x-4 text-white/80 text-sm">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                    <p className="text-muted-foreground">图片加载失败</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="neon-glow holographic">
          <DialogHeader>
            <DialogTitle className="text-center text-glow">删除文件</DialogTitle>
            <DialogDescription className="text-center">
              确定要删除文件 &quot;{file.name}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="neon-glow-green"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="neon-glow-red"
            >
              {isDeleting ? '删除中...' : '确定删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}