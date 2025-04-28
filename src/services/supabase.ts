import { createClient } from "@/lib/supabase";
import { Movie } from "@/constants/movies";

export interface Review {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number;
  review_text: string;
  created_at: string;
}

export async function addReview(movieId: number, rating: number, reviewText: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to add a review");
  }

  // First, get the internal movie ID from our movies table
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", movieId)
    .single();

  if (movieError) {
    throw new Error("Movie not found in database");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        user_id: user.id,
        movie_id: movie.id,
        rating,
        review_text: reviewText,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addToCollection(movie: Movie) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to add to collection");
  }

  // First, insert the movie into the movies table if it doesn't exist
  const { data: existingMovie, error: movieError } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", movie.id)
    .single();

  if (movieError && movieError.code !== "PGRST116") { // PGRST116 is "no rows returned"
    throw movieError;
  }

  let movieId;
  if (!existingMovie) {
    const { data: newMovie, error: insertError } = await supabase
      .from("movies")
      .insert([
        {
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          overview: movie.overview,
        },
      ])
      .select("id")
      .single();

    if (insertError) throw insertError;
    movieId = newMovie.id;
  } else {
    movieId = existingMovie.id;
  }

  // Check if the movie is already in the user's collection
  const { data: existingCollection, error: collectionError } = await supabase
    .from("collection")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movieId)
    .single();

  if (collectionError && collectionError.code !== "PGRST116") {
    throw collectionError;
  }

  if (existingCollection) {
    throw new Error("Movie is already in your collection");
  }

  // Add the movie to the user's collection
  const { data, error } = await supabase
    .from("collection")
    .insert([
      {
        user_id: user.id,
        movie_id: movieId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

interface DatabaseMovie {
  id: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface CollectionItem {
  id: string;
  movie: DatabaseMovie;
}

export async function getCollection() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to view collection");
  }

  const { data, error } = await supabase
    .from("collection")
    .select(`
      id,
      movie:movies (
        id,
        tmdb_id,
        title,
        poster_path,
        release_date,
        vote_average,
        overview
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === '42P01') { // Table does not exist error code
      throw new Error("Please review a movie first");
    }
    throw error;
  }

  if (!data) {
    return [];
  }

  // Transform the data to match the expected format
  return data.map(item => {
    const movie = (item as unknown as CollectionItem).movie;
    return {
      id: movie.tmdb_id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview
    };
  });
}

export async function getReview(movieId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to view reviews");
  }

  // First, get the internal movie ID from our movies table
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", movieId)
    .single();

  if (movieError) {
    return null;
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .eq("movie_id", movie.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") { // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

export async function isInCollection(movieId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to check collection");
  }

  // First, get the internal movie ID from our movies table
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", movieId)
    .single();

  if (movieError) {
    return false;
  }

  const { data, error } = await supabase
    .from("collection")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movie.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") { // No rows returned
      return false;
    }
    throw error;
  }

  return true;
}

export async function removeFromCollection(movieId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to remove from collection");
  }

  // First, get the internal movie ID from our movies table
  const { data: movie, error: movieError } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", movieId)
    .single();

  if (movieError) {
    throw new Error("Movie not found in database");
  }

  const { error } = await supabase
    .from("collection")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movie.id);

  if (error) throw error;
} 