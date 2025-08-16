import packageJson from "@/package.json"

export interface VersionInfo {
  version: string
  buildTime?: string
  gitCommit?: string
  releaseType?: string
}

/**
 * 获取应用版本信息
 */
export function getAppVersion(): string {
  return packageJson.version
}

/**
 * 获取完整的版本信息字符串
 */
export function getVersionString(): string {
  const version = getAppVersion()
  return `v${version}`
}

/**
 * 获取带有版本的应用名称
 */
export function getAppNameWithVersion(): string {
  const version = getAppVersion()
  return `TuBed v${version}`
}

/**
 * 获取详细的版本信息
 * 优先从 version.json 文件读取，如果不存在则使用 package.json
 */
export async function getDetailedVersionInfo(): Promise<VersionInfo> {
  try {
    // 尝试从 version.json 获取详细信息
    const response = await fetch("/version.json")
    if (response.ok) {
      const versionInfo = await response.json()
      return versionInfo
    }
  } catch (error) {
    console.warn("Unable to fetch detailed version info:", error)
  }

  // 回退到基本版本信息
  return {
    version: getAppVersion()
  }
}

/**
 * 获取构建信息字符串
 */
export async function getBuildInfo(): Promise<string> {
  const info = await getDetailedVersionInfo()
  const parts = [`v${info.version}`]
  
  if (info.gitCommit) {
    parts.push(`(${info.gitCommit})`)
  }
  
  if (info.buildTime) {
    const buildDate = new Date(info.buildTime).toLocaleDateString()
    parts.push(`built ${buildDate}`)
  }
  
  return parts.join(" ")
}

/**
 * 同步版本的简化版本（用于服务端渲染）
 */
export function getVersionInfoSync(): VersionInfo {
  return {
    version: getAppVersion()
  }
}

/**
 * 格式化版本显示
 */
export function formatVersionDisplay(info: VersionInfo): string {
  let display = `TuBed v${info.version}`
  
  if (info.gitCommit) {
    display += ` (${info.gitCommit})`
  }
  
  return display
}