import { useState, useEffect } from 'react';
import FaceScanner from '../components/FaceScanner';
import MovieResult from '../components/MovieResult';
import { supabase } from '../lib/supabase';
import { getRecommendedGenres } from '../lib/recommendationLogic'; 
import { fetchMoviesByGenres, fetchMovieTrailer, fetchTrendingMovies } from '../lib/tmdb'; // Added fetchTrendingMovies
import { Loader2, Flame } from 'lucide-react'; // Added Flame icon

export default function Dashboard() {
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [recommendedMovie, setRecommendedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [genreString, setGenreString] = useState('');
  const [isFetchingMovie, setIsFetchingMovie] = useState(false);
  
  // NEW: State for the Trending Slider
  const [trendingMovies, setTrendingMovies] = useState([]);

  useEffect(() => {
    const initData = async () => {
      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('gender').eq('id', user.id).single();
        setUserProfile(data);
      }
      
      // Fetch trending movies for the eye-candy slider
      const trending = await fetchTrendingMovies();
      setTrendingMovies(trending);
    };
    initData();
  }, []);

  const handleEmotionResult = (emotion) => {
    setDetectedEmotion(emotion.toUpperCase());
  };

  const handleGetRecommendations = async () => {
    if (!userProfile) {
      alert("Please log in to get demographic-aware recommendations!");
      return;
    }
    
    setIsFetchingMovie(true);
    try {
      const genres = getRecommendedGenres(detectedEmotion, userProfile.gender);
      setGenreString(genres); 

      const movies = await fetchMoviesByGenres(genres);
      if (movies && movies.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(10, movies.length));
        const selectedMovie = movies[randomIndex];
        setRecommendedMovie(selectedMovie);

        const trailer = await fetchMovieTrailer(selectedMovie.id);
        setTrailerKey(trailer);
      }
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
    } finally {
      setIsFetchingMovie(false);
    }
  };

  const handleReset = () => {
    setDetectedEmotion(null);
    setRecommendedMovie(null);
    setTrailerKey(null);
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-12 overflow-hidden">
      {!recommendedMovie && (
        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">What should we watch?</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Let our AI analyze your expression to recommend the perfect movie for your current mood.
          </p>
        </div>
      )}

      {/* The AI Scanner Block */}
      <div className="relative z-10">
        {!detectedEmotion && !recommendedMovie && (
          <FaceScanner onEmotionDetected={handleEmotionResult} />
        )}

        {detectedEmotion && !recommendedMovie && (
          <div className="text-center max-w-2xl mx-auto p-12 border border-gray-800 rounded-xl bg-gradient-to-b from-gray-900 to-black shadow-2xl">
            <h2 className="text-2xl text-gray-400 mb-2">You appear to be...</h2>
            <p className="text-6xl font-bold text-white mb-8 bg-gradient-to-r from-netflix-red to-red-500 bg-clip-text text-transparent">
              {detectedEmotion}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                className="flex items-center gap-2 px-8 py-4 bg-netflix-red text-white font-bold rounded hover:bg-red-700 transition disabled:opacity-50"
                onClick={handleGetRecommendations}
                disabled={isFetchingMovie}
              >
                {isFetchingMovie ? (
                  <><Loader2 className="animate-spin" /> Fetching Masterpiece...</>
                ) : (
                  "Get AI Recommendation"
                )}
              </button>
              <button 
                className="px-6 py-4 border border-gray-600 text-white font-bold rounded hover:border-white transition"
                onClick={handleReset}
                disabled={isFetchingMovie}
              >
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* The Recommended Movie Result */}
      {recommendedMovie && (
        <MovieResult 
          movie={recommendedMovie}
          trailerKey={trailerKey}
          emotion={detectedEmotion}
          genreString={genreString}
          onReset={handleReset}
        />
      )}

      {/* NEW: The Netflix-Style Trending Slider (Eye Candy) */}
      {!recommendedMovie && trendingMovies.length > 0 && (
        <div className="mt-20 max-w-7xl mx-auto animate-fade-in">
          <div className="flex items-center gap-2 mb-4 px-4">
            <Flame className="text-orange-500" />
            <h2 className="text-xl font-bold text-white">Trending Worldwide</h2>
          </div>
          
          {/* Custom invisible scrollbar for the slider */}
          <div className="flex overflow-x-auto gap-4 pb-8 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {trendingMovies.map((movie) => (
              <div 
                key={movie.id} 
                className="min-w-[160px] md:min-w-[200px] snap-start relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10"
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  className="rounded-lg shadow-lg border border-gray-800"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-sm font-bold text-white mb-2">{movie.title}</p>
                  <p className="text-xs text-netflix-red font-medium border border-netflix-red px-2 py-1 rounded">
                    Scan face to unlock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}