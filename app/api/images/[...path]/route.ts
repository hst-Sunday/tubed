import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { lookup } from "mime-types"
import sharp from "sharp"

// 支持的图片格式
type SupportedFormat = 'webp' | 'jpeg' | 'jpg' | 'png' | 'avif' | 'gif'

// 支持的适配模式
type FitMode = 'cover' | 'contain' | 'fill' | 'inside' | 'outside'

// 图片转换选项接口
interface ImageTransformOptions {
  format?: SupportedFormat
  quality?: number
  width?: number
  height?: number
  fit?: FitMode
}

// 解析查询参数
function parseTransformOptions(searchParams: URLSearchParams): ImageTransformOptions {
  const options: ImageTransformOptions = {}

  // 格式转换
  const format = searchParams.get('format')?.toLowerCase()
  if (format && ['webp', 'jpeg', 'jpg', 'png', 'avif', 'gif'].includes(format)) {
    options.format = format as SupportedFormat
  }

  // 质量设置 (1-100)
  const quality = searchParams.get('quality')
  if (quality) {
    const q = parseInt(quality, 10)
    if (!isNaN(q) && q >= 1 && q <= 100) {
      options.quality = q
    }
  }

  // 宽度设置
  const width = searchParams.get('width') || searchParams.get('w')
  if (width) {
    const w = parseInt(width, 10)
    if (!isNaN(w) && w > 0 && w <= 4096) { // 限制最大宽度
      options.width = w
    }
  }

  // 高度设置
  const height = searchParams.get('height') || searchParams.get('h')
  if (height) {
    const h = parseInt(height, 10)
    if (!isNaN(h) && h > 0 && h <= 4096) { // 限制最大高度
      options.height = h
    }
  }

  // 适配模式
  const fit = searchParams.get('fit')?.toLowerCase()
  if (fit && ['cover', 'contain', 'fill', 'inside', 'outside'].includes(fit)) {
    options.fit = fit as FitMode
  }

  return options
}

// 应用图片转换
async function transformImage(
  buffer: Buffer,
  options: ImageTransformOptions
): Promise<{ buffer: Buffer; mimeType: string }> {
  let pipeline = sharp(buffer)

  // 调整尺寸
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: options.fit || 'cover',
      withoutEnlargement: true, // 不放大图片，只缩小
    })
  }

  // 格式转换
  const format = options.format || 'jpeg'
  const quality = options.quality || 80

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality })
      return {
        buffer: await pipeline.toBuffer(),
        mimeType: 'image/webp'
      }
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({ quality })
      return {
        buffer: await pipeline.toBuffer(),
        mimeType: 'image/jpeg'
      }
    case 'png':
      pipeline = pipeline.png({ quality })
      return {
        buffer: await pipeline.toBuffer(),
        mimeType: 'image/png'
      }
    case 'avif':
      pipeline = pipeline.avif({ quality })
      return {
        buffer: await pipeline.toBuffer(),
        mimeType: 'image/avif'
      }
    case 'gif':
      pipeline = pipeline.gif()
      return {
        buffer: await pipeline.toBuffer(),
        mimeType: 'image/gif'
      }
    default:
      return {
        buffer: await pipeline.toBuffer(),
        mimeType: 'image/jpeg'
      }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 解析params
    const resolvedParams = await params
    
    // 构建文件路径
    const imagePath = resolvedParams.path.join('/')
    const filePath = path.join(process.cwd(), 'public', 'uploads', imagePath)
    
    // 解析查询参数
    const searchParams = request.nextUrl.searchParams
    const transformOptions = parseTransformOptions(searchParams)
    
    // 调试信息
    console.log(`[Image API] Raw params:`, resolvedParams.path)
    console.log(`[Image API] Requesting: ${imagePath}`)
    console.log(`[Image API] File path: ${filePath}`)
    console.log(`[Image API] Exists: ${existsSync(filePath)}`)
    console.log(`[Image API] Transform options:`, transformOptions)
    
    // 安全检查：确保路径在 public 目录内
    const publicDir = path.join(process.cwd(), 'public')
    const resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(publicDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    
    // 读取文件
    const fileBuffer = await readFile(filePath)
    
    // 检查是否需要转换
    const needsTransform = Object.keys(transformOptions).length > 0
    
    let finalBuffer: Buffer
    let mimeType: string
    
    if (needsTransform) {
      // 应用图片转换
      const transformed = await transformImage(fileBuffer, transformOptions)
      finalBuffer = transformed.buffer
      mimeType = transformed.mimeType
      console.log(`[Image API] Transformed to ${mimeType}`)
    } else {
      // 不需要转换，直接返回原文件
      finalBuffer = fileBuffer
      mimeType = lookup(filePath) || 'application/octet-stream'
    }
    
    // 返回文件
    return new Response(new Uint8Array(finalBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}