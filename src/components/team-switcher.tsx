"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { ChevronsUpDown, Plus, GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const iconMap = [GalleryVerticalEnd, AudioWaveform, Command];

export function TeamSwitcher({
  teams: initialTeams,
}: {
  teams?: {
    name: string
    logo: string // string key, but will be replaced by icon assignment
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [workspaces, setWorkspaces] = useState<any[]>(initialTeams || [])
  const [loading, setLoading] = useState(false)
  const [activeTeam, setActiveTeam] = useState<any>(initialTeams?.[0] || null)

  useEffect(() => {
    async function fetchWorkspaces() {
      setLoading(true)
      try {
        const res = await fetch("/api/workspaces")
        if (!res.ok) throw new Error("Failed to fetch workspaces")
        const data = await res.json()
        // Assign icons in a round-robin fashion
        const withIcons = (data.workspaces || []).map((ws: any, i: number) => ({
          ...ws,
          logo: iconMap[i % iconMap.length],
          plan: ws.plan || "Workspace"
        }))
        setWorkspaces(withIcons)
        setActiveTeam(withIcons[0] || null)
      } catch (err) {
        // fallback to initialTeams if fetch fails
        setWorkspaces(initialTeams || [])
        setActiveTeam((initialTeams && initialTeams[0]) || null)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkspaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!activeTeam) {
    return <div className="p-2 text-muted-foreground text-xs">No workspaces</div>
  }

  const ActiveIcon = activeTeam.logo || GalleryVerticalEnd;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={loading}
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {ActiveIcon && <ActiveIcon className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((team, index) => {
              const Icon = team.logo || GalleryVerticalEnd;
              return (
              <DropdownMenuItem
                  key={team.id || team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                    {Icon && <Icon className="size-3.5 shrink-0" />}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
