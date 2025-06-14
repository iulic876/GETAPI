"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const methodColors: Record<string, string> = {
  GET: "bg-gray-200 text-gray-800",
  POST: "bg-yellow-200 text-yellow-800",
  PUT: "bg-blue-200 text-blue-800",
  DELETE: "bg-red-200 text-red-800",
};

export default function RequestRunner() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    const res = await fetch("/api/send-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, url, body }),
    });

    const data = await res.text(); // can be json/html/etc
    setResponse(data);
  };

  return (
    <div className="w-full mx-auto space-y-6 p-6">
      <Card className="w-full">
        <CardContent className="space-y-4 pt-6 w-full">
          <div className="flex space-x-4">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <span className={cn(
                  "inline-block rounded px-2 py-1 text-xs font-semibold",
                  methodColors[method] || methodColors.GET
                )}>
                  {method}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">
                  <span className={cn(
                    "inline-block rounded px-2 py-1 text-xs font-semibold mr-2",
                    methodColors.GET
                  )}>GET</span>
                </SelectItem>
                <SelectItem value="POST">
                  <span className={cn(
                    "inline-block rounded px-2 py-1 text-xs font-semibold mr-2",
                    methodColors.POST
                  )}>POST</span>
                </SelectItem>
                <SelectItem value="PUT">
                  <span className={cn(
                    "inline-block rounded px-2 py-1 text-xs font-semibold mr-2",
                    methodColors.PUT
                  )}>PUT</span>
                </SelectItem>
                <SelectItem value="DELETE">
                  <span className={cn(
                    "inline-block rounded px-2 py-1 text-xs font-semibold mr-2",
                    methodColors.DELETE
                  )}>DELETE</span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />

            <Button onClick={handleSend}>Send</Button>
          </div>

          {/* Tabs carousel for Params, Auth, etc. */}
          <Tabs defaultValue="params" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="params">Params</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>
            <TabsContent value="params">Params content (key-value pairs UI goes here)</TabsContent>
            <TabsContent value="auth">Auth content (authentication UI goes here)</TabsContent>
            <TabsContent value="headers">Headers content (headers UI goes here)</TabsContent>
            <TabsContent value="body">Body content (body UI goes here)</TabsContent>
          </Tabs>

          <div>
            <Label className="text-neutral-500 mb-2">Body (JSON)</Label>
            <Textarea
              value={body}
              onChange={(e : any) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="pt-6 w-full">
          <Label>Response</Label>
          <pre className="whitespace-pre-wrap mt-2 text-sm bg-muted p-4 rounded">
            {response || "No response yet."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
