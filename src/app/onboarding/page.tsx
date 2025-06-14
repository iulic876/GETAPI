"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUserName(data.user?.name || "user");
      } catch (err: any) {
        setError("Could not fetch user info");
        setUserName("user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setWorkspaceError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create workspace");
      }
      if (res.ok) {
        router.push("/collections");
        return;
      }
      setSuccess(true);
      setDialogOpen(false);
      setWorkspaceName("");
    } catch (err: any) {
      setWorkspaceError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">
        {loading ? "Loading..." : `Hello ${userName}`}
      </h1>
      <p className="text-lg mb-8">Create your workspace</p>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" disabled={loading}>
            Create Workspace
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new workspace</DialogTitle>
            <DialogDescription>
              Enter a name for your workspace. You can change this later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <Input
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              required
              autoFocus
              disabled={creating}
            />
            {workspaceError && <div className="text-red-500 text-sm">{workspaceError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={!workspaceName.trim() || creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {success && <div className="text-green-600 mt-4">Workspace created successfully!</div>}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
