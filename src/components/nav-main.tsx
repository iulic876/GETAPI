"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useParams } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  collections = [],
  requests = [],
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      subItems?: { title: string; url: string }[]
    }[]
  }[],
  collections?: any[],
  requests?: any[],
}) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  // Group requests by collection_id
  const requestsByCollection: Record<string, any[]> = {};
  requests.forEach((req) => {
    if (!requestsByCollection[req.collection_id]) requestsByCollection[req.collection_id] = [];
    requestsByCollection[req.collection_id].push(req);
  });

  // Transform collections into the format expected by the sidebar
  const collectionsItem = {
    title: "Collections",
    url: "#",
    icon: items[0]?.icon,
    isActive: true,
    items: collections.map(collection => ({
      title: collection.name,
      url: `/collections/${collection.id}`,
      subItems: (requestsByCollection[collection.id] || []).map((req) => ({
        title: req.name,
        url: `/requests/${req.id}`,
      })),
    })),
  };

  // Replace the collections item with real data
  const updatedItems = items.map(item =>
    item.title === "Collections" ? collectionsItem : item
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible key="collections-group" asChild defaultOpen className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Collections">
                {collectionsItem.icon && <collectionsItem.icon />}
                <span>{collectionsItem.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {collections.map((collection) => (
                  <Collapsible key={collection.id} asChild>
                    <SidebarMenuSubItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuSubButton asChild>
                          <a href={`/collections/${collection.id}`}>
                            <span>{collection.name}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {(requestsByCollection[collection.id] || []).map((req) => (
                            <SidebarMenuSubItem key={req.id}>
                              <SidebarMenuSubButton asChild>
                                <a href={`/requests/${req.id}`}>
                                  <span>{req.name}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuSubItem>
                  </Collapsible>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
