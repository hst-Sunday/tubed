"use client"

import { useState } from "react"
import { UploadZone } from "@/components/upload-zone"
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
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth"
import { Zap, Shield, Rocket, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const { logout } = useAuth()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  return (
    <AuthGuard>
      <div className="min-h-screen digital-rain">
        <div className="scan-lines fixed inset-0 pointer-events-none z-10"></div>

        {/* 主要内容 */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6 relative">
              <div className="space-y-4 flex items-center justify-center gap-8">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center neon-glow float">
                    {/* <Zap className="w-12 h-12 text-primary" /> */}
                    <Image src="/logo.png" alt="Tubed" className="rounded-xl" width={100} height={100} />
                  </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-[var(--font-dm-sans)] text-foreground text-glow glitch">
                  TuBed
                  <span className="text-primary"> 图片托管</span>
                </h2>
                {/* <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                体验下一代图床服务，支持拖拽上传、粘贴上传，让您的图片管理更加高效便捷
              </p> */}
              </div>

              {/* <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-secondary float">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">安全加密</span>
              </div>
              <div className="flex items-center gap-2 text-secondary float" style={{ animationDelay: "1s" }}>
                <Rocket className="w-5 h-5" />
                <span className="text-sm font-medium">极速上传</span>
              </div>
              <div className="flex items-center gap-2 text-secondary float" style={{ animationDelay: "2s" }}>
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">全球CDN</span>
              </div>
            </div> */}

              {/* <div className="mb-6">
              <h1 className="text-3xl font-[var(--font-dm-sans)] text-primary text-glow">CyberHost</h1>
              <p className="text-sm text-muted-foreground">赛博朋克图床服务</p>
              <Badge variant="outline" className="border-secondary text-secondary neon-glow-green mt-2">
                Beta v2.0
              </Badge>
            </div> */}
            </div>

            {/* 上传组件 */}
            <UploadZone />

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center space-y-4 neon-glow holographic hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto float">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-[var(--font-dm-sans)]">拖拽上传</h3>
                <p className="text-muted-foreground text-sm">直接拖拽图片到上传区域，简单快捷</p>
              </Card>

              <Card
                className="p-6 text-center space-y-4 neon-glow holographic hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: "0.5s" }}
              >
                <div
                  className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto float"
                  style={{ animationDelay: "1s" }}
                >
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-[var(--font-dm-sans)]">粘贴上传</h3>
                <p className="text-muted-foreground text-sm">Ctrl+V 直接粘贴剪贴板图片，效率翻倍</p>
              </Card>

              <Card
                className="p-6 text-center space-y-4 neon-glow holographic hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: "1s" }}
              >
                <div
                  className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto float"
                  style={{ animationDelay: "2s" }}
                >
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-[var(--font-dm-sans)]">即时分享</h3>
                <p className="text-muted-foreground text-sm">一键复制链接，立即分享给任何人</p>
              </Card>
            </div>
          </div>
        </main>

        {/* 悬浮操作按钮 */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4">
          <Link href="/dashboard">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full neon-glow-blue float hover:scale-110 transition-all duration-300 shadow-lg"
              title="文件管理"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </Link>

          <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full neon-glow-purple float hover:scale-110 transition-all duration-300 shadow-lg"
                title="退出登录"
              >
                <LogOut className="w-6 h-6" />
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
                  className="neon-glow-purple"
                >
                  确定退出
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <footer className="border-t border-border/50 mt-20 neon-glow-green">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">© 2025 Powered by TuBed</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
