import { useEffect, useState } from 'react';
import { Film, LogOut, Clock, Sun, Moon } from 'lucide-react'; // Added Sun & Moon
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true); // Default to our dark theme
  const navigate = useNavigate();

  // Handle Authentication State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Handle Light/Dark Mode Toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-transparent transition-colors">
      <Link to="/" className="flex items-center gap-2 text-netflix-red">
        <Film size={32} strokeWidth={2.5} />
        <span className="text-2xl font-bold tracking-wider">EMOTIONFLIX</span>
      </Link>
      
      <div className="flex gap-4 items-center">
        
        {/* THEME TOGGLE BUTTON */}
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <>
            <Link to="/history" className="flex items-center gap-2 px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition">
              <Clock size={18} />
              My History
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-1.5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition border-l border-gray-300 dark:border-gray-700 pl-4"
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