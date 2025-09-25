"use client"

import {
  Home,
  Database,
  FileText,
  Search,
  Key,
  Settings,
  ChevronUp,
  User2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Main navigation items
const items = [
  {
    title: "대시보드",
    url: "/",
    icon: Home,
  },
  {
    title: "Collection 관리",
    url: "/collections",
    icon: Database,
  },
  {
    title: "문서 관리",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "검색",
    url: "/search",
    icon: Search,
  },
  {
    title: "API 키 관리",
    url: "/api-keys",
    icon: Key,
  },
  {
    title: "설정",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { isMobile } = useSidebar()

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-bold text-sidebar-foreground py-3 px-2">RAG 파이프라인</SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User2 />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">관리자</span>
                    <span className="truncate text-xs">admin@company.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings />
                  계정 설정
                </DropdownMenuItem>
                <DropdownMenuItem>
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}