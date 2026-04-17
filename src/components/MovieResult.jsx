import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Play, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MovieResult({ movie, trailerKey, emotion, genreString, onReset }) {
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // THIS IS FOR CHAPTER 4 EVALUATION
  const handleRating = async (isPositive) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Save the rating to the database!
      await supabase.from('recommendations').insert([
        {
          user_id: user.id,
          detected_emotion: emotion,
          suggested_genre: genreString,
          movie_title: movie.title,
          user_rating: isPositive
        }
      ]);

      setRatingSubmitted(true);
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl animate-fade-in relative">
      
      {/* Cinematic Background Image */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Poster & Evaluation */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="rounded-lg shadow-lg border border-gray-700 w-64 md:w-full object-cover"
          />
          
          {/* THE EVALUATION BLOCK */}
          <div className="mt-6 p-4 bg-black/60 rounded-lg border border-gray-700 w-full text-center backdrop-blur-sm">
            {!ratingSubmitted ? (
              <>
                <p className="text-sm text-gray-300 mb-3 font-medium">
                  We recommended this because you are <span className="text-netflix-red font-bold">{emotion}</span>. 
                  Was this a good pick?
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => handleRating(true)} className="p-3 bg-gray-800 hover:bg-green-600/20 hover:text-green-500 rounded-full transition group">
                    <ThumbsUp size={24} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => handleRating(false)} className="p-3 bg-gray-800 hover:bg-red-600/20 hover:text-red-500 rounded-full transition group">
                    <ThumbsDown size={24} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <p className="text-green-400 font-bold py-4">Thanks for your feedback! ✓</p>
            )}
          </div>
        </div>

        {/* Right Column: Trailer & Info */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{movie.title}</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Release Date: {movie.release_date} • Rating: {movie.vote_average.toFixed(1)}/10
          </p>
          <p className="text-gray-200 text-lg leading-relaxed mb-8">
            {movie.overview}
          </p>

          {trailerKey ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&controls=1`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video w-full flex flex-col items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
               <Play size={48} className="text-gray-600 mb-2" />
               <p className="text-gray-500">No official trailer available</p>
            </div>
          )}

          <button 
            onClick={onReset}
            className="mt-8 self-start flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 transition"
          >
            <RotateCcw size={20} />
            Scan Again
          </button>
        </div>

      </div>
    </div>
  );
}