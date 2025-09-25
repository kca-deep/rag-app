"use client"

import { useState } from "react"
import { Upload, X, File, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUploadZone } from "@/components/ui/file-upload-zone"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
}

export function DocumentUploadModal({ open, onOpenChange }: DocumentUploadModalProps) {
  const [selectedCollection, setSelectedCollection] = useState("")
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesSelected = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      progress: 0,
      status: "pending" as const
    }))
    setUploadFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!selectedCollection || uploadFiles.length === 0) return

    setIsUploading(true)

    // Simulate upload process
    for (let i = 0; i < uploadFiles.length; i++) {
      setUploadFiles(prev => prev.map((file, index) =>
        index === i ? { ...file, status: "uploading" } : file
      ))

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadFiles(prev => prev.map((file, index) =>
          index === i ? { ...file, progress } : file
        ))
      }

      // Simulate completion or error
      const isError = Math.random() < 0.1 // 10% chance of error
      setUploadFiles(prev => prev.map((file, index) =>
        index === i ? {
          ...file,
          status: isError ? "error" : "completed",
          error: isError ? "파일 처리 중 오류가 발생했습니다." : undefined
        } : file
      ))
    }

    setIsUploading(false)

    // Auto close after successful upload
    const hasErrors = uploadFiles.some(file => file.status === "error")
    if (!hasErrors) {
      setTimeout(() => {
        onOpenChange(false)
        setUploadFiles([])
        setSelectedCollection("")
      }, 1000)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canUpload = selectedCollection && uploadFiles.length > 0 && !isUploading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>문서 업로드</DialogTitle>
          <DialogDescription>
            컬렉션에 새 문서를 업로드하고 벡터 인덱싱을 시작합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Collection Selection */}
          <div className="space-y-2">
            <Label htmlFor="collection">대상 컬렉션</Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger>
                <SelectValue placeholder="컬렉션을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Product Documentation</SelectItem>
                <SelectItem value="2">Customer Support</SelectItem>
                <SelectItem value="3">Legal Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Zone */}
          {uploadFiles.length === 0 && (
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              accept=".pdf,.doc,.docx,.txt,.md"
              maxSize={10 * 1024 * 1024} // 10MB
              multiple
            />
          )}

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>업로드할 파일 ({uploadFiles.length}개)</Label>
                {!isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    파일 추가
                  </Button>
                )}
              </div>

              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelected(Array.from(e.target.files))
                  }
                }}
              />

              <div className="max-h-60 overflow-y-auto space-y-2">
                {uploadFiles.map((uploadFile, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <File className="h-8 w-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>

                      {uploadFile.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={uploadFile.progress} className="h-2" />
                        </div>
                      )}

                      {uploadFile.status === "error" && uploadFile.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {uploadFile.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {uploadFile.status === "completed" && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {uploadFile.status === "error" && (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                      {!isUploading && uploadFile.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  업로드 시작
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}