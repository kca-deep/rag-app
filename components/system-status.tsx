import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

type StatusType = "healthy" | "warning" | "error"

interface StatusItemProps {
  name: string
  status: StatusType
  lastChecked: string
}

function StatusItem({ name, status, lastChecked }: StatusItemProps) {
  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-secondary" />
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "healthy":
        return "정상"
      case "warning":
        return "주의"
      case "error":
        return "오류"
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        {getStatusIcon(status)}
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">마지막 확인: {lastChecked}</p>
        </div>
      </div>
      <span className="text-sm font-medium">{getStatusText(status)}</span>
    </div>
  )
}

export function SystemStatus() {
  const services = [
    {
      name: "Milvus 벡터 데이터베이스",
      status: "healthy" as StatusType,
      lastChecked: "방금 전"
    },
    {
      name: "Redis 캐시 서버",
      status: "healthy" as StatusType,
      lastChecked: "1분 전"
    },
    {
      name: "API 서버",
      status: "healthy" as StatusType,
      lastChecked: "방금 전"
    },
    {
      name: "문서 동기화 서비스",
      status: "warning" as StatusType,
      lastChecked: "5분 전"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>시스템 상태</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {services.map((service, index) => (
            <StatusItem
              key={index}
              name={service.name}
              status={service.status}
              lastChecked={service.lastChecked}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}