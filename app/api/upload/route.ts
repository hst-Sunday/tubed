import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomBytes } from "crypto"
import { validateFileSize, isFileTypeAllowed, getFileCategory } from "@/lib/file-types"
import { insertFile, type FileRecord } from "@/lib/database"
// 导入迁移模块以确保在首次使用数据库时执行迁移
import "@/lib/migrate"

interface UploadedFileInfo {
  id: string
  name: string
  url: string
  size: number
  type: string
  category: string
  uploadedAt: string
}

function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, ext)
  const randomSuffix = randomBytes(8).toString("hex")
  const timestamp = Date.now()
  return `${nameWithoutExt}_${timestamp}_${randomSuffix}${ext}`
}

export async function POST(req: NextRequest) {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Parse form data using native FormData API
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadedFiles: UploadedFileInfo[] = []

    for (const file of files) {
      if (!file) {
        continue
      }

      // 验证文件类型是否被允许
      if (!isFileTypeAllowed(file)) {
        return NextResponse.json({ 
          error: `不支持的文件类型: ${file.name}` 
        }, { status: 400 })
      }

      // 验证文件大小
      const sizeValidation = validateFileSize(file)
      if (!sizeValidation.valid) {
        return NextResponse.json({ 
          error: sizeValidation.error 
        }, { status: 400 })
      }

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(file.name)
      const filePath = path.join(uploadsDir, uniqueFilename)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Create file info
      const fileInfo: UploadedFileInfo = {
        id: randomBytes(16).toString("hex"),
        name: file.name,
        url: `/uploads/${uniqueFilename}`,
        size: file.size,
        type: file.type,
        category: getFileCategory(file),
        uploadedAt: new Date().toISOString(),
      }

      // Save to database
      try {
        insertFile(fileInfo as FileRecord)
        uploadedFiles.push(fileInfo)
      } catch (dbError) {
        console.error("Database save error:", dbError)
        // 如果数据库保存失败，删除已上传的文件
        const fs = await import("fs/promises")
        try {
          await fs.unlink(filePath)
        } catch (unlinkError) {
          console.error("Failed to cleanup file:", unlinkError)
        }
        return NextResponse.json(
          { error: `Failed to save file metadata for ${file.name}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

