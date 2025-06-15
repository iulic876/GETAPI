"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;
  const [collection, setCollection] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/collections/${collectionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch collection");
        setCollection(data.collection);
        setRequests(data.requests || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (collectionId) fetchData();
  }, [collectionId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const res = await fetch(`/api/collections/${collectionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete collection");
      router.push("/");
      window.dispatchEvent(new CustomEvent('refreshMe'));
    } catch (err) {
      alert("Error deleting collection");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!collection) return <div>Collection not found.</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
      <div className="mb-4 text-gray-600">{requests.length} requests in this collection</div>
      <Button variant="destructive" onClick={handleDelete}>Delete Collection</Button>
    </div>
  );
}
