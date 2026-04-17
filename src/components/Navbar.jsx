import { useEffect, useState } from 'react';
import { Film, LogOut, Clock } from 'lucide-react'; // <-- Added Clock import
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
      <Link to="/" className="flex items-center gap-2 text-netflix-red">
        <Film size={32} strokeWidth={2.5} />
        <span className="text-2xl font-bold tracking-wider">EMOTIONFLIX</span>
      </Link>
      
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            {/* NEW: My History Link */}
            <Link to="/history" className="flex items-center gap-2 px-4 py-1.5 text-gray-300 hover:text-white transition">
              <Clock size={18} />
              My History
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-1.5 text-gray-300 hover:text-white transition border-l border-gray-700 pl-4"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="px-4 py-1.5 bg-netflix-red text-white font-medium rounded hover:bg-red-700 transition">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}