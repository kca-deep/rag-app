'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, X } from 'lucide-react'
import { useCreateCollection, useCheckCollectionName } from '@/hooks/use-collections'
import { CollectionCreate } from '@/lib/types'
import { toast } from 'sonner'

const collectionFormSchema = z.object({
  name: z
    .string()
    .min(1, '컬렉션 이름을 입력해주세요')
    .min(2, '컬렉션 이름은 최소 2글자 이상이어야 합니다')
    .max(100, '컬렉션 이름은 100글자를 초과할 수 없습니다')
    .regex(/^[a-zA-Z0-9가-힣\s\-_]+$/, '컬렉션 이름에는 문자, 숫자, 공백, 하이픈, 언더스코어만 사용 가능합니다'),
  description: z
    .string()
    .max(500, '설명은 500글자를 초과할 수 없습니다')
    .optional(),
  embedding_model: z
    .string()
    .min(1, '임베딩 모델을 선택해주세요'),
  chunk_size: z
    .number()
    .min(100, '청크 크기는 최소 100이어야 합니다')
    .max(8000, '청크 크기는 최대 8000이어야 합니다'),
  chunk_overlap: z
    .number()
    .min(0, '청크 오버랩은 0 이상이어야 합니다')
    .max(500, '청크 오버랩은 500을 초과할 수 없습니다'),
  tags: z
    .array(z.string())
    .default([]),
})

type CollectionFormData = z.infer<typeof collectionFormSchema>

const EMBEDDING_MODELS = [
  {
    value: 'text-embedding-3-small',
    label: 'OpenAI Text Embedding 3 Small (1536차원)',
    dimensions: 1536,
  },
  {
    value: 'text-embedding-3-large',
    label: 'OpenAI Text Embedding 3 Large (3072차원)',
    dimensions: 3072,
  },
  {
    value: 'text-embedding-ada-002',
    label: 'OpenAI Text Embedding Ada 002 (1536차원)',
    dimensions: 1536,
  },
]

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
}: CreateCollectionDialogProps) {
  const [tagInput, setTagInput] = useState('')

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      embedding_model: 'text-embedding-3-small',
      chunk_size: 1000,
      chunk_overlap: 200,
      tags: [],
    },
  })

  const watchedName = form.watch('name')
  const watchedTags = form.watch('tags')

  // Check name availability
  const { data: nameAvailable } = useCheckCollectionName(watchedName)

  // Create collection mutation
  const createCollectionMutation = useCreateCollection({
    onSuccess: () => {
      toast.success('컬렉션이 성공적으로 생성되었습니다.')
      onOpenChange(false)
      form.reset()
      setTagInput('')
    },
    onError: (error: any) => {
      toast.error(`컬렉션 생성 실패: ${error.error || error.message}`)
    },
  })

  const onSubmit = (data: CollectionFormData) => {
    const collectionData: CollectionCreate = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      embedding_model: data.embedding_model,
      chunk_size: data.chunk_size,
      chunk_overlap: data.chunk_overlap,
      tags: data.tags.length > 0 ? data.tags : undefined,
    }

    createCollectionMutation.mutate(collectionData)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !watchedTags.includes(tag)) {
      const newTags = [...watchedTags, tag]
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove)
    form.setValue('tags', newTags)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleClose = () => {
    if (createCollectionMutation.isPending) return
    onOpenChange(false)
    form.reset()
    setTagInput('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 컬렉션 생성</DialogTitle>
          <DialogDescription>
            문서를 저장하고 벡터 임베딩을 생성할 새로운 컬렉션을 만듭니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Collection Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>컬렉션 이름 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: Product Documentation"
                      {...field}
                      disabled={createCollectionMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    컬렉션을 식별할 수 있는 고유한 이름을 입력하세요.
                    {watchedName && nameAvailable === false && (
                      <span className="text-destructive block mt-1">
                        이미 사용 중인 컬렉션 이름입니다.
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="이 컬렉션에 저장될 문서의 종류나 목적을 설명해주세요..."
                      rows={3}
                      {...field}
                      disabled={createCollectionMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    컬렉션의 용도나 포함될 문서 유형을 설명해주세요. (선택사항)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Embedding Model */}
            <FormField
              control={form.control}
              name="embedding_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>임베딩 모델 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createCollectionMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="임베딩 모델을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMBEDDING_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    문서의 벡터 임베딩을 생성할 모델을 선택하세요. 선택 후 변경이 어렵습니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Chunk Settings */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chunk_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>청크 크기 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={100}
                        max={8000}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={createCollectionMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      문서를 분할할 청크의 크기 (글자 수)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chunk_overlap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>청크 오버랩 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={500}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={createCollectionMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      인접한 청크 간 중복할 글자 수
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>태그</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="태그 입력 후 Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        disabled={createCollectionMutation.isPending}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || createCollectionMutation.isPending}
                      >
                        추가
                      </Button>
                    </div>
                    {watchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {watchedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    컬렉션을 분류할 태그를 추가하세요. (선택사항)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createCollectionMutation.isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  createCollectionMutation.isPending ||
                  nameAvailable === false ||
                  !form.formState.isValid
                }
              >
                {createCollectionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                컬렉션 생성
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}