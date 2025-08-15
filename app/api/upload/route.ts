import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomBytes } from "crypto"

interface UploadedFileInfo {
  id: string
  name: string
  url: string
  size: number
  type: string
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
      if (!file || !file.type.startsWith("image/")) {
        continue // Skip non-image files
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} is too large (max 10MB)` }, { status: 400 })
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
        uploadedAt: new Date().toISOString(),
      }

      uploadedFiles.push(fileInfo)
    }

    // Store metadata (simple JSON file approach)
    await storeFileMetadata(uploadedFiles)

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

async function storeFileMetadata(files: UploadedFileInfo[]) {
  try {
    const metadataPath = path.join(process.cwd(), "uploads-metadata.json")
    let existingData: UploadedFileInfo[] = []

    // Read existing metadata if file exists
    if (existsSync(metadataPath)) {
      const { readFile } = await import("fs/promises")
      const existingContent = await readFile(metadataPath, "utf-8")
      existingData = JSON.parse(existingContent)
    }

    // Append new files
    const updatedData = [...existingData, ...files]

    // Write back to file
    await writeFile(metadataPath, JSON.stringify(updatedData, null, 2))
  } catch (error) {
    console.error("Failed to store metadata:", error)
    // Don't fail the entire upload if metadata storage fails
  }
}