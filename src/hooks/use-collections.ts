import { useEffect, useState } from "react";

interface Collection {
  id: string;
  name: string;
  workspace_id: string;
  created_at: string;
}

export function useCollections(workspaceId: string) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch(`/api/collections/${workspaceId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }
        const data = await response.json();
        setCollections(data.collections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (workspaceId) {
      fetchCollections();
    }
  }, [workspaceId]);

  const createCollection = async (name: string) => {
    try {
      const response = await fetch(`/api/collections/${workspaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create collection");
      }

      const data = await response.json();
      setCollections(prev => [data.collection, ...prev]);
      return data.collection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateCollection = async (collectionId: string, name: string) => {
    try {
      const response = await fetch(`/api/collections/${workspaceId}/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update collection");
      }

      const data = await response.json();
      setCollections(prev => 
        prev.map(collection => 
          collection.id === collectionId ? data.collection : collection
        )
      );
      return data.collection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      const response = await fetch(`/api/collections/${workspaceId}/${collectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete collection");
      }

      const data = await response.json();
      setCollections(prev => 
        prev.filter(collection => collection.id !== collectionId)
      );
      return data.collection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  return { 
    collections, 
    loading, 
    error, 
    createCollection, 
    updateCollection, 
    deleteCollection 
  };
} 