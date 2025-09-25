"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string | null
  onConfirm: () => void
}

// Mock function to get collection name
const getCollectionName = (id: string | null): string => {
  if (!id) return ""

  const collections: Record<string, string> = {
    "1": "Product Documentation",
    "2": "Customer Support",
    "3": "Legal Documents"
  }

  return collections[id] || "Unknown Collection"
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  collectionId,
  onConfirm
}: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [acknowledgeDataLoss, setAcknowledgeDataLoss] = useState(false)
  const [acknowledgeIrreversible, setAcknowledgeIrreversible] = useState(false)

  const collectionName = getCollectionName(collectionId)
  const isConfirmTextValid = confirmText === collectionName
  const canDelete = isConfirmTextValid && acknowledgeDataLoss && acknowledgeIrreversible

  const handleConfirm = async () => {
    if (!canDelete) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Call the parent's confirm handler
      onConfirm()

      // Reset state
      setConfirmText("")
      setAcknowledgeDataLoss(false)
      setAcknowledgeIrreversible(false)

    } catch (error) {
      console.error("Failed to delete collection:", error)
      alert("Collection 삭제에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setConfirmText("")
    setAcknowledgeDataLoss(false)
    setAcknowledgeIrreversible(false)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Collection 삭제
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>"{collectionName}"</strong> Collection을 완전히 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>경고:</strong> 이 작업은 되돌릴 수 없습니다. 다음 데이터가 영구적으로 삭제됩니다:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>모든 문서와 메타데이터</li>
                <li>벡터 인덱스</li>
                <li>검색 히스토리</li>
                <li>통계 데이터</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm font-medium">
                Collection 이름을 정확히 입력하여 삭제를 확인해주세요:
              </Label>
              <Input
                id="confirm-text"
                placeholder={collectionName}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isLoading}
                className={confirmText && !isConfirmTextValid ? "border-destructive" : ""}
              />
              {confirmText && !isConfirmTextValid && (
                <p className="text-xs text-destructive">
                  Collection 이름이 일치하지 않습니다.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acknowledge-data-loss"
                  checked={acknowledgeDataLoss}
                  onCheckedChange={(checked) => setAcknowledgeDataLoss(checked as boolean)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="acknowledge-data-loss"
                  className="text-sm leading-5"
                >
                  모든 데이터가 영구적으로 삭제됨을 이해합니다.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acknowledge-irreversible"
                  checked={acknowledgeIrreversible}
                  onCheckedChange={(checked) => setAcknowledgeIrreversible(checked as boolean)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="acknowledge-irreversible"
                  className="text-sm leading-5"
                >
                  이 작업은 되돌릴 수 없음을 이해합니다.
                </Label>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canDelete || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                영구 삭제
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}