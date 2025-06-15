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
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AppSidebar useEffect running');
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        setMe(data);
      })
      .catch(err => {
        console.error('Failed to fetch /api/auth/me', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const collections = me?.collections || [];
  const requests = me?.requests || [];
  // You can also extract workspaces, user, etc. from me if needed

  useEffect(() => {
    const handler = () => {
      setLoading(true);
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => {
          setMe(data);
          setLoading(false);
        });
    };
    window.addEventListener('refreshMe', handler);
    return () => window.removeEventListener('refreshMe', handler);
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher teams={me?.workspaces || []} />
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
        <NavMain
          items={[
            {
              title: "Collections",
              url: "#",
              icon: SquareTerminal,
              isActive: true,
            },
          ]}
          collections={collections}
          requests={requests}
        />
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
  const { state } = useSidebar();
  const [type, setType] = useState<string>("");
  const [request, setRequest] = useState({ name: "", url: "", method: "GET" });
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const [workspaceId, setWorkspaceId] = useState(params.workspaceId as string | undefined);
  const refreshSidebar = () => {
    // Find the AppSidebar's setMe function and call it
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('refreshMe');
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    if (!workspaceId) {
      fetch('/api/workspaces')
        .then(res => res.json())
        .then(data => {
          if (data.workspaces && data.workspaces.length > 0) {
            setWorkspaceId(data.workspaces[0].id);
          }
        });
    }
  }, [workspaceId]);

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

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) {
      setError("No workspace selected.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/collections/${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collectionName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add collection");
      setSuccess(true);
      setCollectionName("");
      setOpen(false);
      refreshSidebar();
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
        <form className="flex flex-col gap-2 mt-2" onSubmit={handleAddCollection}>
          <Input
            placeholder="Collection name"
            value={collectionName}
            onChange={e => setCollectionName(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          {success && <div className="text-green-600 text-xs mt-1">Collection added!</div>}
        </form>
      )}
    </div>
  );
}
