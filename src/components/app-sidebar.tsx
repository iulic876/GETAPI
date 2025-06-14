"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher as WorkspaceSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  workspaces: [
    {
      name: "Acme Inc",
      logo: "gallery",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "audio",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "command",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Collections",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [], // This will be populated by the useCollections hook
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher teams={data.workspaces} />
        {state === "expanded" && (
          <div className="flex justify-between gap-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-xs">
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New</DialogTitle>
                  <DialogDescription>
                    Choose what you want to create.
                  </DialogDescription>
                </DialogHeader>
                <NewDialogContent setOpen={setOpen} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger>
                <Button variant="outline" className="text-xs">
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Collection</DialogTitle>
                  <DialogDescription>
                    Import a collection from a file or URL.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={[{ title: "Collections", url: "#", icon: SquareTerminal, isActive: true }]} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NewDialogContent({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [type, setType] = useState<string>("");
  const [request, setRequest] = useState({ name: "", url: "", method: "GET" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add request");
      setSuccess(true);
      setRequest({ name: "", url: "", method: "GET" });
      setOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="request">New HTTP Request</SelectItem>
          <SelectItem value="collection">New Collection</SelectItem>
        </SelectContent>
      </Select>

      {type === "request" && (
        <form className="flex flex-col gap-2 mt-2" onSubmit={handleAddRequest}>
          <Input
            placeholder="Request name"
            value={request.name}
            onChange={e => setRequest(r => ({ ...r, name: e.target.value }))}
            required
          />
          <Select value={request.method} onValueChange={method => setRequest(r => ({ ...r, method }))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Request URL"
            value={request.url}
            onChange={e => setRequest(r => ({ ...r, url: e.target.value }))}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          {success && <div className="text-green-600 text-xs mt-1">Request added!</div>}
        </form>
      )}

      {type === "collection" && (
        <div className="mt-2 text-muted-foreground">Collection creation form here (existing logic).</div>
      )}
    </div>
  );
}
