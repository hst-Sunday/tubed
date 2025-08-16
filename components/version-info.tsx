"use client"

import { useState, useEffect } from "react"
import { getDetailedVersionInfo, formatVersionDisplay, type VersionInfo } from "@/lib/version"

interface VersionInfoProps {
  className?: string
  showDetails?: boolean
}

export function VersionInfo({ className = "", showDetails = false }: VersionInfoProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        const info = await getDetailedVersionInfo()
        setVersionInfo(info)
      } catch (error) {
        console.error("Failed to load version info:", error)
        // 使用基本版本信息作为回退
        setVersionInfo({ version: "0.1.0" })
      } finally {
        setLoading(false)
      }
    }

    loadVersionInfo()
  }, [])

  if (loading) {
    return <span className={className}>加载中...</span>
  }

  if (!versionInfo) {
    return <span className={className}>TuBed</span>
  }

  if (!showDetails) {
    return <span className={className}>{formatVersionDisplay(versionInfo)}</span>
  }

  return (
    <div className={className}>
      <div className="text-sm font-medium">
        {formatVersionDisplay(versionInfo)}
      </div>
      {versionInfo.buildTime && (
        <div className="text-xs text-muted-foreground">
          构建于 {new Date(versionInfo.buildTime).toLocaleString()}
        </div>
      )}
      {versionInfo.releaseType && (
        <div className="text-xs text-muted-foreground">
          发布类型: {versionInfo.releaseType}
        </div>
      )}
    </div>
  )
}