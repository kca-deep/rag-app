"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-end gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                3
              </span>
              <span className="sr-only">알림</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h4 className="font-semibold mb-2">알림</h4>
              <div className="space-y-2">
                <div className="p-2 text-sm bg-muted rounded">
                  <p className="font-medium">Collection 동기화 완료</p>
                  <p className="text-muted-foreground text-xs">5분 전</p>
                </div>
                <div className="p-2 text-sm bg-muted rounded">
                  <p className="font-medium">새 문서 업로드됨</p>
                  <p className="text-muted-foreground text-xs">10분 전</p>
                </div>
                <div className="p-2 text-sm bg-muted rounded">
                  <p className="font-medium">API 키 사용량 80% 도달</p>
                  <p className="text-muted-foreground text-xs">1시간 전</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}