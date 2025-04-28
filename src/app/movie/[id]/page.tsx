"use client";

import { fetchMovieDetails } from "@/services/tmdb";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Star, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { addReview, addToCollection, getReview, isInCollection, removeFromCollection } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { use } from "react";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MoviePage({ params }: MoviePageProps) {
  const resolvedParams = use(params);
  const [movie, setMovie] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInUserCollection, setIsInUserCollection] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadMovieAndReview = async () => {
      try {
        const movieData = await fetchMovieDetails(parseInt(resolvedParams.id));
        if (!movieData) {
          notFound();
        }
        setMovie(movieData);

        // Load existing review if it exists
        const review = await getReview(parseInt(resolvedParams.id));
        if (review) {
          setRating(review.rating);
          setReviewText(review.review_text || "");
        }

        // Check if movie is in collection
        const inCollection = await isInCollection(parseInt(resolvedParams.id));
        setIsInUserCollection(inCollection);
      } catch (error: any) {
        setError(error.message);
      }
    };
    loadMovieAndReview();
  }, [resolvedParams.id]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const handleAddToCollection = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setIsLoading(true);
      await addToCollection(movie);
      await addReview(movie.id, rating, reviewText);
      setIsInUserCollection(true);
      router.push("/collection");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCollection = async () => {
    try {
      setIsLoading(true);
      await removeFromCollection(movie.id);
      setIsInUserCollection(false);
      router.push("/collection");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex items-center">
            {posterUrl ? (
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden w-full">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center w-full">
                <span className="text-gray-500 dark:text-gray-400">No poster available</span>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 space-y-6 flex flex-col justify-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{movie.title}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-gray-600 dark:text-gray-400">
                <span>{movie.release_date?.split("-")[0] || 'N/A'}</span>
                {movie.runtime && <span>{movie.runtime} min</span>}
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-400 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Overview</h2>
              <p className="text-gray-600 dark:text-gray-400">{movie.overview || 'No overview available'}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Review</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`focus:outline-none ${
                          star <= rating ? "text-yellow-400" : "text-gray-400"
                        }`}
                        onClick={() => setRating(star)}
                        type="button"
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review
                  </label>
                  <Textarea
                    placeholder="Write your review here..."
                    className="min-h-[100px]"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                {isInUserCollection ? (
                  <Button onClick={handleRemoveFromCollection} disabled={isLoading} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isLoading ? "Removing..." : "Remove from Collection"}
                  </Button>
                ) : (
                  <Button onClick={handleAddToCollection} disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isLoading ? "Adding..." : "Add to Collection"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 