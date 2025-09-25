"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Database, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  name: z.string()
    .min(1, "Collection 이름을 입력해주세요")
    .max(50, "이름은 50자를 초과할 수 없습니다")
    .regex(/^[a-zA-Z0-9\s\-_가-힣]+$/, "영문, 숫자, 한글, 하이픈, 언더스코어만 사용 가능합니다"),
  description: z.string()
    .max(500, "설명은 500자를 초과할 수 없습니다")
    .optional(),
  enableAutoSync: z.boolean().default(true),
  chunkSize: z.number().min(100).max(2000).default(1000),
  chunkOverlap: z.number().min(0).max(500).default(200),
})

type FormData = z.infer<typeof formSchema>

interface CreateCollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCollectionModal({
  open,
  onOpenChange
}: CreateCollectionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      enableAutoSync: true,
      chunkSize: 1000,
      chunkOverlap: 200,
    },
  })

  const onSubmit = async (values: FormData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log("Creating collection:", values)

      // Reset form and close modal
      form.reset()
      onOpenChange(false)

      // Show success message (you might want to use toast here)
      alert("Collection이 성공적으로 생성되었습니다!")

    } catch (error) {
      console.error("Failed to create collection:", error)
      // Handle error (show error message)
      alert("Collection 생성에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[60vw] !max-h-[90vh] !w-[60vw] overflow-y-auto p-8 sm:!max-w-[60vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            새 Collection 생성
          </DialogTitle>
          <DialogDescription>
            문서를 그룹화할 새로운 Collection을 만듭니다. Collection은 독립적인 벡터 인덱스를 가집니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection 이름 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: Product Documentation"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      고유한 Collection 이름을 입력하세요 (영문, 숫자, 한글, -, _ 사용 가능)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="이 Collection에 대한 설명을 입력하세요..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Collection의 용도나 포함될 문서 유형을 설명해주세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <Label className="text-sm font-medium">문서 처리 설정</Label>
                </div>

                <FormField
                  control={form.control}
                  name="enableAutoSync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">자동 동기화</FormLabel>
                        <FormDescription>
                          문서가 업데이트될 때 자동으로 벡터 인덱스를 동기화합니다
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chunkSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>청크 크기</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={100}
                            max={2000}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          토큰 단위 (100-2000)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chunkOverlap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>청크 중복</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={500}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          토큰 단위 (0-500)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Collection 생성 후에는 이름을 변경할 수 없습니다. 신중히 입력해주세요.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "Collection 생성"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}