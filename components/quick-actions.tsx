import { Plus, Upload, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto flex-col gap-2 py-4" variant="outline">
            <Plus className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">새 Collection</div>
              <div className="text-xs text-muted-foreground">Collection 생성</div>
            </div>
          </Button>

          <Button className="h-auto flex-col gap-2 py-4" variant="outline">
            <Upload className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">문서 업로드</div>
              <div className="text-xs text-muted-foreground">파일 업로드</div>
            </div>
          </Button>

          <Button className="h-auto flex-col gap-2 py-4" variant="outline">
            <Key className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">API 키 발급</div>
              <div className="text-xs text-muted-foreground">새 키 생성</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}