"use client";

import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SearchDialog from "@/components/SearchDialog";
import { getCollection } from "@/services/supabase";
import { useRouter } from "next/navigation";

interface CollectionMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export default function CollectionPage() {
  const [movies, setMovies] = useState<CollectionMovie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const collection = await getCollection();
        setMovies(collection);
      } catch (error: any) {
        setError(error.message);
        if (error.message.includes("must be logged in")) {
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadCollection();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 dark:text-white">Loading your collection...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          {error === "Please review a movie first" ? (
            <>
              <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your collection is empty
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please review a movie first to start building your collection
              </p>
              <Button onClick={() => setIsSearchOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Movie
              </Button>
            </>
          ) : (
            <div className="text-xl font-semibold text-red-500">{error}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Media Collection</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track and display your favorite movies, books, and TV shows</p>
        </div>
        <Button onClick={() => setIsSearchOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Media
        </Button>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your collection is empty</h2>
          <p className="text-gray-600 dark:text-gray-400">Add some movies to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
} 