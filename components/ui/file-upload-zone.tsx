"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, File, FileText, Image, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FileWithPreview extends File {
  id: string
  preview?: string
}

export interface FileUploadZoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
  onDrop?: (files: File[]) => void
  disabled?: boolean
  showPreview?: boolean
}

const FileUploadZone = React.forwardRef<HTMLDivElement, FileUploadZoneProps>(
  (
    {
      className,
      accept,
      multiple = true,
      maxSize,
      maxFiles,
      onFilesChange,
      onDrop,
      disabled,
      showPreview = true,
      children,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<FileWithPreview[]>([])
    const [dragActive, setDragActive] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }, [])

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (disabled) return

        const droppedFiles = Array.from(e.dataTransfer.files)
        handleFiles(droppedFiles)
      },
      [disabled]
    )

    const handleFiles = React.useCallback(
      (newFiles: File[]) => {
        let validFiles = newFiles

        if (maxSize) {
          validFiles = validFiles.filter((file) => file.size <= maxSize)
        }

        if (maxFiles) {
          validFiles = validFiles.slice(0, maxFiles - files.length)
        }

        const filesWithPreview: FileWithPreview[] = validFiles.map((file) => ({
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        }))

        const updatedFiles = multiple ? [...files, ...filesWithPreview] : filesWithPreview
        setFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
        onDrop?.(validFiles)
      },
      [files, maxSize, maxFiles, multiple, onFilesChange, onDrop]
    )

    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          handleFiles(Array.from(e.target.files))
        }
      },
      [handleFiles]
    )

    const removeFile = React.useCallback(
      (fileId: string) => {
        setFiles((prev) => {
          const updatedFiles = prev.filter((file) => file.id !== fileId)
          onFilesChange?.(updatedFiles)
          return updatedFiles
        })
      },
      [onFilesChange]
    )

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const getFileIcon = (file: File) => {
      if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />
      if (file.type.includes("text") || file.type.includes("document")) return <FileText className="h-4 w-4" />
      return <File className="h-4 w-4" />
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            dragActive && "border-primary bg-primary/5",
            disabled && "pointer-events-none opacity-50",
            !disabled && "hover:border-primary/50 cursor-pointer"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="sr-only"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">파일을 끌어놓거나</span>{" "}
              <span className="text-primary underline">클릭하여 선택</span>
            </div>
            {maxSize && (
              <p className="text-xs text-muted-foreground">
                최대 파일 크기: {formatFileSize(maxSize)}
              </p>
            )}
            {maxFiles && (
              <p className="text-xs text-muted-foreground">
                최대 {maxFiles}개 파일
              </p>
            )}
          </div>

          {children}
        </div>

        {showPreview && files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">선택된 파일 ({files.length}개)</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                        {getFileIcon(file)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.type || "unknown"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)
FileUploadZone.displayName = "FileUploadZone"

export { FileUploadZone }