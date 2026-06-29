import { useState, useEffect } from 'react';
import FaceScanner from '../components/FaceScanner';
import MovieResult from '../components/MovieResult';
import { supabase } from '../lib/supabase';
import { getRecommendedGenres } from '../lib/recommendationLogic'; 
import { fetchMoviesByGenres, fetchMovieTrailer, fetchTrendingMovies } from '../lib/tmdb';
import { Loader2, Flame, Sparkles, Camera } from 'lucide-react';

export default function Dashboard() {
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [recommendedMovie, setRecommendedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [genreString, setGenreString] = useState('');
  const [isFetchingMovie, setIsFetchingMovie] = useState(false);
  
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Force FaceScanner remount
  const [scannerKey, setScannerKey] = useState(0);

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('gender')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
      
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
      console.error(error);
    } finally {
      setIsFetchingMovie(false);
    }
  };

  const handleReset = () => {
    setDetectedEmotion(null);
    setRecommendedMovie(null);
    setTrailerKey(null);
    setScannerKey(prev => prev + 1); // force remount
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-10 pb-12 transition-colors flex flex-col justify-between">

      {/* HERO SECTION */}
      {!recommendedMovie && (
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center mb-8">

          {/* LEFT: Text Info */}
          <div className="space-y-6 z-10">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              What should we <span className="text-netflix-red">watch?</span>
            </h1>

            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md">
              Our AI analyzes your facial expression and recommends movies that perfectly match your current mood.
            </p>

            <div className="space-y-3 mt-6 text-sm text-gray-700 dark:text-gray-300">
              <p className="flex gap-3 items-center"><Camera size={18} className="text-gray-500"/> Enable camera access</p>
              <p className="flex gap-3 items-center"><Sparkles size={18} className="text-gray-500"/> Let AI detect your mood</p>
              <p className="flex gap-3 items-center"><Flame size={18} className="text-gray-500"/> Get demographic-aware recommendations</p>
            </div>
          </div>

          {/* RIGHT: AI Scanner */}
          <div className="relative bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl overflow-hidden max-w-md mx-auto w-full transition-colors">

            {!detectedEmotion && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="w-full h-1 bg-netflix-red/50 animate-scan shadow-[0_0_15px_rgba(229,9,20,0.8)]" />
              </div>
            )}

            {!detectedEmotion && (
              <FaceScanner key={scannerKey} onEmotionDetected={handleEmotionResult} />
            )}

            {detectedEmotion && !recommendedMovie && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Detected Mood</p>

                <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-netflix-red to-red-500 bg-clip-text text-transparent">
                  {detectedEmotion}
                </h2>

                <div className="flex flex-col gap-4 justify-center">
                  <button 
                    onClick={handleGetRecommendations}
                    disabled={isFetchingMovie}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-netflix-red text-white font-bold rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isFetchingMovie ? <><Loader2 className="animate-spin" /> Analyzing Database...</> : "Get Movie Recommendation"}
                  </button>

                  <button 
                    onClick={handleReset}
                    className="w-full py-4 border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:border-white dark:hover:text-white font-bold rounded transition"
                  >
                    Rescan Face
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* RESULT COMPONENT */}
      {recommendedMovie && (
        <MovieResult movie={recommendedMovie} trailerKey={trailerKey} emotion={detectedEmotion} genreString={genreString} onReset={handleReset} />
      )}

      {/* TRENDING CAROUSEL */}
      {!recommendedMovie && trendingMovies.length > 0 && (
        <div className="w-full mt-auto pb-4 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center gap-2">
            <Flame className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Worldwide</h2>
          </div>

          <div className="relative w-full overflow-hidden flex">
            <div className="flex gap-4 animate-carousel hover:[animation-play-state:paused] w-max px-4">
              {[...trendingMovies, ...trendingMovies, ...trendingMovies].map((movie, index) => (
                <div key={index} className="min-w-[160px] md:min-w-[200px] relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg">
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center">
                    <p className="text-sm font-bold text-white mb-3 leading-snug">{movie.title}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-netflix-red border border-netflix-red px-2 py-1 rounded bg-black/50">Scan to unlock</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(250px); opacity: 0; }
        }
        .animate-scan { animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        @keyframes carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-carousel { animation: carousel 40s linear infinite; }
      `}} />
    </div>
  );
}