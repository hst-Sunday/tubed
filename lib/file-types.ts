import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  FileImage,
  Sheet,
  File,
} from "lucide-react"

export interface FileTypeConfig {
  category: string
  icon: typeof FileText
  extensions: string[]
  mimeTypes: string[]
  maxSizeMB: number
  acceptString: string
}

export const FILE_CATEGORIES = {
  IMAGE: "image",
  DOCUMENT: "document", 
  VIDEO: "video",
  AUDIO: "audio",
  ARCHIVE: "archive",
  CODE: "code",
  PDF: "pdf",
  SPREADSHEET: "spreadsheet",
  OTHER: "other",
} as const

export const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
  [FILE_CATEGORIES.IMAGE]: {
    category: FILE_CATEGORIES.IMAGE,
    icon: Image,
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"],
    mimeTypes: [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/x-icon"
    ],
    maxSizeMB: 10,
    acceptString: "image/*"
  },
  [FILE_CATEGORIES.DOCUMENT]: {
    category: FILE_CATEGORIES.DOCUMENT,
    icon: FileText,
    extensions: [".doc", ".docx", ".txt", ".rtf", ".odt"],
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/rtf",
      "application/vnd.oasis.opendocument.text"
    ],
    maxSizeMB: 50,
    acceptString: ".doc,.docx,.txt,.rtf,.odt"
  },
  [FILE_CATEGORIES.PDF]: {
    category: FILE_CATEGORIES.PDF,
    icon: FileImage,
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    maxSizeMB: 50,
    acceptString: ".pdf"
  },
  [FILE_CATEGORIES.SPREADSHEET]: {
    category: FILE_CATEGORIES.SPREADSHEET,
    icon: Sheet,
    extensions: [".xls", ".xlsx", ".csv", ".ods"],
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/vnd.oasis.opendocument.spreadsheet"
    ],
    maxSizeMB: 50,
    acceptString: ".xls,.xlsx,.csv,.ods"
  },
  [FILE_CATEGORIES.VIDEO]: {
    category: FILE_CATEGORIES.VIDEO,
    icon: Video,
    extensions: [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"],
    mimeTypes: [
      "video/mp4",
      "video/avi", 
      "video/quicktime",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/webm",
      "video/x-matroska"
    ],
    maxSizeMB: 500,
    acceptString: "video/*"
  },
  [FILE_CATEGORIES.AUDIO]: {
    category: FILE_CATEGORIES.AUDIO,
    icon: Music,
    extensions: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma"],
    mimeTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/flac", 
      "audio/aac",
      "audio/ogg",
      "audio/x-ms-wma"
    ],
    maxSizeMB: 100,
    acceptString: "audio/*"
  },
  [FILE_CATEGORIES.ARCHIVE]: {
    category: FILE_CATEGORIES.ARCHIVE,
    icon: Archive,
    extensions: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    mimeTypes: [
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/x-tar",
      "application/gzip",
      "application/x-bzip2"
    ],
    maxSizeMB: 200,
    acceptString: ".zip,.rar,.7z,.tar,.gz,.bz2"
  },
  [FILE_CATEGORIES.CODE]: {
    category: FILE_CATEGORIES.CODE,
    icon: Code,
    extensions: [".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".xml", ".py", ".java", ".cpp", ".c", ".php"],
    mimeTypes: [
      "text/javascript",
      "text/typescript",
      "text/html",
      "text/css",
      "application/json",
      "application/xml",
      "text/x-python",
      "text/x-java-source",
      "text/x-c",
      "application/x-php"
    ],
    maxSizeMB: 10,
    acceptString: ".js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.py,.java,.cpp,.c,.php"
  },
  [FILE_CATEGORIES.OTHER]: {
    category: FILE_CATEGORIES.OTHER,
    icon: File,
    extensions: [],
    mimeTypes: [],
    maxSizeMB: 100,
    acceptString: "*/*"
  }
}

export function getFileCategory(file: File): string {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  
  // 检查每个文件类型配置
  for (const [category, config] of Object.entries(FILE_TYPE_CONFIGS)) {
    if (category === FILE_CATEGORIES.OTHER) continue
    
    // 检查扩展名
    const matchesExtension = config.extensions.some(ext => fileName.endsWith(ext))
    
    // 检查MIME类型
    const matchesMimeType = config.mimeTypes.some(mime => fileType === mime || fileType.startsWith(mime.split('/')[0] + '/'))
    
    if (matchesExtension || matchesMimeType) {
      return category
    }
  }
  
  return FILE_CATEGORIES.OTHER
}

export function getFileTypeConfig(file: File): FileTypeConfig {
  const category = getFileCategory(file)
  return FILE_TYPE_CONFIGS[category]
}

export function isFileTypeAllowed(file: File): boolean {
  const category = getFileCategory(file)
  return category !== FILE_CATEGORIES.OTHER || file.size <= FILE_TYPE_CONFIGS[FILE_CATEGORIES.OTHER].maxSizeMB * 1024 * 1024
}

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const config = getFileTypeConfig(file)
  const maxBytes = config.maxSizeMB * 1024 * 1024
  
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `文件 ${file.name} 超过大小限制 (最大 ${config.maxSizeMB}MB)`
    }
  }
  
  return { valid: true }
}

export function getAllAcceptedTypes(): string {
  return Object.values(FILE_TYPE_CONFIGS)
    .filter(config => config.category !== FILE_CATEGORIES.OTHER)
    .map(config => config.acceptString)
    .join(',')
}

export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`
}

export function getFileIconComponent(file: File) {
  const config = getFileTypeConfig(file)
  return config.icon
}

// 获取支持的文件类型描述
export function getSupportedFileTypesDescription(): string {
  const categories = Object.values(FILE_TYPE_CONFIGS)
    .filter(config => config.category !== FILE_CATEGORIES.OTHER)
    .map(config => {
      switch (config.category) {
        case FILE_CATEGORIES.IMAGE: return '图片'
        case FILE_CATEGORIES.DOCUMENT: return '文档'
        case FILE_CATEGORIES.PDF: return 'PDF'
        case FILE_CATEGORIES.SPREADSHEET: return '表格'
        case FILE_CATEGORIES.VIDEO: return '视频'
        case FILE_CATEGORIES.AUDIO: return '音频'
        case FILE_CATEGORIES.ARCHIVE: return '压缩包'
        case FILE_CATEGORIES.CODE: return '代码'
        default: return ''
      }
    })
    .filter(Boolean)
  
  return categories.join('、')
}