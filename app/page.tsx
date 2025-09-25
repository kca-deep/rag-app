import { Database, FileText, Key, Activity } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { SystemStatus } from "@/components/system-status"
import { QuickActions } from "@/components/quick-actions"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Collections"
          value="24"
          description="활성 컬렉션 수"
          icon={Database}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="전체 문서"
          value="1,234"
          description="인덱싱된 문서"
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="API 키"
          value="8"
          description="발급된 키 수"
          icon={Key}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="금일 요청"
          value="156"
          description="오늘 처리된 요청"
          icon={Activity}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* 컨텐츠 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SystemStatus />
        </div>
        <div className="col-span-3">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
