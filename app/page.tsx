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
import { getAppNameWithVersion } from "@/lib/version"
import { Zap, Shield, Rocket, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const { logout } = useAuth()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsLogoutDialogOpen(false)
    // 强制跳转到登录页面
    window.location.href = '/login'
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">
        {/* 主要内容 */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6 relative">
              <div className="space-y-4 flex items-center justify-center gap-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center border-[4px] border-black shadow-[8px_8px_0px_0px_#000000]">
                    <Image src="/logo.png" alt="Tubed" className="rounded-xl" width={100} height={100} />
                  </div>
                </div>

                <h2 className="text-5xl md:text-7xl font-extrabold text-foreground uppercase tracking-tighter">
                  TuBed
                  <span className="text-primary block md:inline"> 图片托管</span>
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
              <Card className="p-6 text-center space-y-4 bg-primary/20 hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto border-[3px] border-black shadow-[6px_6px_0px_0px_#000000]">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-extrabold uppercase">拖拽上传</h3>
                <p className="text-foreground text-sm font-semibold">直接拖拽图片到上传区域，简单快捷</p>
              </Card>

              <Card className="p-6 text-center space-y-4 bg-secondary/20 hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto border-[3px] border-black shadow-[6px_6px_0px_0px_#000000]">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-extrabold uppercase">粘贴上传</h3>
                <p className="text-foreground text-sm font-semibold">Ctrl+V 直接粘贴剪贴板图片，效率翻倍</p>
              </Card>

              <Card className="p-6 text-center space-y-4 bg-accent/20 hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto border-[3px] border-black shadow-[6px_6px_0px_0px_#000000]">
                  <Rocket className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-extrabold uppercase">即时分享</h3>
                <p className="text-foreground text-sm font-semibold">一键复制链接，立即分享给任何人</p>
              </Card>
            </div>
          </div>
        </main>

        {/* 悬浮操作按钮 */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4">
          <Link href="/dashboard">
            <Button
              size="icon"
              variant="outline"
              className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground hover:translate-x-1 hover:translate-y-1"
              title="文件管理"
            >
              <Settings className="w-8 h-8" />
            </Button>
          </Link>

          <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-2xl hover:translate-x-1 hover:translate-y-1"
                title="退出登录"
              >
                <LogOut className="w-8 h-8" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">退出登录</DialogTitle>
                <DialogDescription className="text-center font-semibold">
                  您确定要退出登录吗？退出后需要重新输入验证码才能访问。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  确定退出
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <footer className="border-t-[4px] border-black mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-foreground">
              <p className="text-sm font-bold uppercase">© 2025 Powered by {getAppNameWithVersion()}</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
