"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth"
import { FileCard } from "@/components/file-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FileRecord, FileStats } from "@/lib/database"
import { FILE_CATEGORIES } from "@/lib/file-types"
import { Search, Home, LogOut, RefreshCw, BarChart3, CheckSquare, Square, Trash2 } from "lucide-react"
import { Toaster, toast } from "sonner"
import Link from "next/link"

export default function DashboardPage() {
  const { logout } = useAuth()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [stats, setStats] = useState<FileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'name' | 'size'>('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  // 批量操作状态
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)

  const filesPerPage = 15

  const fetchFiles = async (page: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: filesPerPage.toString(),
        sortBy,
        sortOrder,
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/files?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
        setTotalPages(data.pagination?.totalPages || 1)
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/files?stats=true')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchFiles(currentPage)
  }, [currentPage, searchQuery, selectedCategory, sortBy, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStats()
  }, [])

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A 全选
      if (event.ctrlKey && event.key === 'a' && selectionMode) {
        event.preventDefault()
        selectAllFiles()
      }
      // ESC 退出选择模式
      if (event.key === 'Escape' && selectionMode) {
        toggleSelectionMode()
      }
      // Delete 键删除选中文件
      if (event.key === 'Delete' && selectionMode && selectedFiles.size > 0) {
        setIsBatchDeleteDialogOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectionMode, selectedFiles]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFileDelete = (deletedId: string) => {
    setFiles(prev => prev.filter(file => file.id !== deletedId))
    fetchStats() // 刷新统计信息
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchFiles(1)
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  // 批量操作函数
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedFiles(new Set()) // 清空选择
  }

  const handleFileSelection = (fileId: string, selected: boolean) => {
    const newSelection = new Set(selectedFiles)
    if (selected) {
      newSelection.add(fileId)
    } else {
      newSelection.delete(fileId)
    }
    setSelectedFiles(newSelection)
  }

  const selectAllFiles = () => {
    const allFileIds = new Set(files.map(file => file.id))
    setSelectedFiles(allFileIds)
  }

  const clearSelection = () => {
    setSelectedFiles(new Set())
  }

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return

    setIsBatchDeleting(true)
    try {
      const response = await fetch('/api/files/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: Array.from(selectedFiles)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // 从列表中移除删除成功的文件
        setFiles(prev => prev.filter(file => !data.results.successful.includes(file.id)))
        setSelectedFiles(new Set()) // 清空选择
        setIsBatchDeleteDialogOpen(false)

        // 显示成功消息
        toast.success(`成功删除 ${data.results.successful.length} 个文件`)

        if (data.results.failed.length > 0) {
          toast.error(`${data.results.failed.length} 个文件删除失败`)
          console.warn('Some files failed to delete:', data.results.failed)
        }

        // 刷新统计信息
        fetchStats()
      } else {
        toast.error('批量删除失败')
      }
    } catch (error) {
      console.error('Batch delete failed:', error)
      toast.error('批量删除过程中出现错误')
    } finally {
      setIsBatchDeleting(false)
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case FILE_CATEGORIES.IMAGE: return '图片'
      case FILE_CATEGORIES.VIDEO: return '视频'
      case FILE_CATEGORIES.AUDIO: return '音频'
      case FILE_CATEGORIES.DOCUMENT: return '文档'
      case FILE_CATEGORIES.PDF: return 'PDF'
      case FILE_CATEGORIES.SPREADSHEET: return '表格'
      case FILE_CATEGORIES.CODE: return '代码'
      case FILE_CATEGORIES.ARCHIVE: return '压缩包'
      default: return '其他'
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = bytes / Math.pow(1024, i)

    return `${size.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`
  }

  return (
    <AuthGuard>
      <div className="min-h-screen digital-rain">
        <div className="scan-lines fixed inset-0 pointer-events-none z-10"></div>
        <Toaster position="top-center" />

        {/* 头部导航 */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 neon-glow-green hover:scale-105 transition-transform">
                  <Home className="w-5 h-5" />
                  <span className="font-medium">返回首页</span>
                </Link>
                <div className="w-px h-6 bg-border"></div>
                <h1 className="text-xl font-[var(--font-dm-sans)] text-primary text-glow">文件管理台</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchFiles(currentPage)}
                  disabled={loading}
                  className="neon-glow-blue"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>

                <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="neon-glow-red">
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="neon-glow holographic">
                    <DialogHeader>
                      <DialogTitle className="text-center text-glow">退出登录</DialogTitle>
                      <DialogDescription className="text-center">
                        您确定要退出登录吗？退出后需要重新输入验证码才能访问。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsLogoutDialogOpen(false)}
                        className="neon-glow-green"
                      >
                        取消
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="neon-glow-red"
                      >
                        确定退出
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* 统计信息 */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center neon-glow holographic">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">总文件数</span>
                  </div>
                  <div className="text-2xl font-bold text-primary text-glow">{stats.totalFiles}</div>
                </Card>

                <Card className="p-4 text-center neon-glow holographic">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">总大小</span>
                  </div>
                  <div className="text-2xl font-bold text-secondary text-glow">{formatFileSize(stats.totalSize)}</div>
                </Card>

                <Card className="p-4 text-center neon-glow holographic">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-muted-foreground">类型数</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 text-glow">{Object.keys(stats.categories).length}</div>
                </Card>

                <Card className="p-4 text-center neon-glow holographic">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-muted-foreground">当前页</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400 text-glow">{currentPage}/{totalPages}</div>
                </Card>
              </div>
            )}

            {/* 搜索和筛选 */}
            <Card className="p-6 neon-glow holographic">
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex space-x-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="搜索文件名..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button type="submit" className="neon-glow-green">
                    搜索
                  </Button>
                </form>

                <div className="flex flex-wrap gap-2 justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory("")
                        setCurrentPage(1)
                      }}
                      className="text-xs"
                    >
                      全部
                    </Button>
                    {stats && Object.entries(stats.categories).map(([category, count]) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category)
                          setCurrentPage(1)
                        }}
                        className="text-xs"
                      >
                        {getCategoryName(category)} ({count})
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'uploadedAt' | 'name' | 'size')}
                      className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      <option value="uploadedAt">按上传时间</option>
                      <option value="name">按文件名</option>
                      <option value="size">按文件大小</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
                      className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      <option value="DESC">降序</option>
                      <option value="ASC">升序</option>
                    </select>
                  </div>
                </div>

                <div className="w-full space-x-2">
                  {/* 批量操作工具栏 */}
                  {files.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant={selectionMode ? "default" : "outline"}
                          onClick={toggleSelectionMode}
                          className={selectionMode ? "neon-glow-cyan" : "neon-glow"}
                        >
                          {selectionMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                          {selectionMode ? "退出选择" : "选择模式"}
                        </Button>

                        {selectionMode && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={selectAllFiles}
                              disabled={selectedFiles.size === files.length}
                              className="neon-glow-green"
                            >
                              全选
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearSelection}
                              disabled={selectedFiles.size === 0}
                              className="neon-glow-blue"
                            >
                              清空
                            </Button>
                          </>
                        )}
                      </div>

                      {selectionMode && selectedFiles.size > 0 && (
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            已选择 {selectedFiles.size} 个文件
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsBatchDeleteDialogOpen(true)}
                            className="neon-glow-red"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            批量删除
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </Card>



            {/* 文件网格 */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDelete={handleFileDelete}
                    selectionMode={selectionMode}
                    isSelected={selectedFiles.has(file.id)}
                    onSelectionChange={handleFileSelection}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center neon-glow holographic">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">没有找到文件</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory
                      ? "尝试调整搜索条件或筛选器"
                      : "您还没有上传任何文件"}
                  </p>
                  {!searchQuery && !selectedCategory && (
                    <Link href="/">
                      <Button className="neon-glow-green">
                        去上传文件
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'neon-glow-green'}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 7) {
                        pageNum = i + 1
                      } else if (currentPage <= 4) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = currentPage - 3 + i
                      }

                      if (pageNum < 1 || pageNum > totalPages) return null

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(pageNum)
                            }}
                            isActive={currentPage === pageNum}
                            className={currentPage === pageNum ? 'neon-glow-blue' : 'neon-glow'}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    {totalPages > 7 && currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'neon-glow-green'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </main>

        {/* 批量删除确认对话框 */}
        <Dialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
          <DialogContent className="neon-glow holographic">
            <DialogHeader>
              <DialogTitle className="text-center text-glow">批量删除文件</DialogTitle>
              <DialogDescription className="text-center">
                您确定要删除选中的 {selectedFiles.size} 个文件吗？此操作无法撤销。
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {Array.from(selectedFiles).slice(0, 10).map((fileId) => {
                  const file = files.find(f => f.id === fileId)
                  return file ? (
                    <div key={fileId} className="flex items-center space-x-3 p-2 bg-background/50 rounded">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                  ) : null
                })}
                {selectedFiles.size > 10 && (
                  <div className="text-center text-sm text-muted-foreground">
                    ... 以及其他 {selectedFiles.size - 10} 个文件
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBatchDeleteDialogOpen(false)}
                disabled={isBatchDeleting}
                className="neon-glow-green"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleBatchDelete}
                disabled={isBatchDeleting}
                className="neon-glow-red"
              >
                {isBatchDeleting ? '删除中...' : `确定删除 ${selectedFiles.size} 个文件`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}