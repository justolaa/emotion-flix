const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}` // Depending on TMDB, you might just need the API key in the URL. We'll use the URL method for safety.
  }
};

export async function fetchMoviesByGenres(genreIds) {
  // We sort by popularity to get good movies
  const url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&language=en-US&page=1`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results; // Returns an array of 20 movies
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

export async function fetchMovieTrailer(movieId) {
  const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Find the official YouTube trailer
    const trailer = data.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    );
    
    return trailer ? trailer.key : null; // Returns the YouTube ID (e.g., "dQw4w9WgXcQ")
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}

export async function fetchTrendingMovies() {
  const url = `${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results; // Returns 20 trending movies
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}