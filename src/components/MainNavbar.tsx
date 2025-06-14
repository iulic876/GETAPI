import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export default function MainNavbar() {
  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-border shadow-sm flex items-center justify-between px-6 h-14">
      <div className="flex items-center gap-2">
        <span className="font-bold text-md tracking-tight text-primary">GETapi</span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">Feedback</Button>
        <Avatar>
          <img
            src="/avatars/shadcn.jpg"
            alt="User Avatar"
            className="rounded-full object-cover"
          />
        </Avatar>
      </div>
    </nav>
  );
}
