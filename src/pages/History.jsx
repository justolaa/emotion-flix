import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThumbsUp, ThumbsDown, Clock, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 2. Fetch their specific recommendations from the database
        const { data, error } = await supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }); // Newest first

        if (!error && data) {
          setHistory(data);
        }
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-28 flex justify-center text-white">Loading your cinematic history...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center text-white">
        <h2 className="text-3xl font-bold mb-4">Please Sign In</h2>
        <p className="text-gray-400 mb-6">You need an account to view your movie history.</p>
        <Link to="/login" className="px-6 py-3 bg-netflix-red rounded font-bold hover:bg-red-700 transition">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-4 md:px-8 pb-12 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <Clock size={32} className="text-netflix-red" />
          <h1 className="text-4xl font-bold">My Watch History</h1>
        </div>

        {history.length === 0 ? (
          <div className="text-center p-12 border border-gray-800 rounded bg-gray-900/50">
            <Film size={48} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl text-gray-400 mb-2">No history yet</h2>
            <p className="text-gray-500">Scan your face and rate some movies to see them here!</p>
            <Link to="/" className="inline-block mt-6 px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition">
              Go to Scanner
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div key={item.id} className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition group relative overflow-hidden">
                {/* A subtle colored edge based on 👍 or 👎 */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.user_rating ? 'bg-green-500' : 'bg-red-500'}`}></div>
                
                <h3 className="text-xl font-bold mb-2 pl-2">{item.movie_title}</h3>
                
                <div className="flex items-center gap-2 mb-4 pl-2">
                  <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300 border border-gray-700">
                    {item.detected_emotion}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-gray-800 pt-4 mt-4 pl-2">
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    {item.user_rating ? (
                      <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                        <ThumbsUp size={16} /> Liked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                        <ThumbsDown size={16} /> Disliked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}