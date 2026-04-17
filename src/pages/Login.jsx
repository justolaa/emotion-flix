import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!gender) throw new Error("Please select your demographic.");

        // We pass the gender inside options.data!
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              gender: gender // The database trigger will catch this automatically
            }
          }
        });
        if (authError) throw authError;

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      navigate('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative">
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="bg-black/80 p-12 rounded-md w-full max-w-md z-10 border border-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-white">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        {error && <div className="bg-netflix-red/20 text-netflix-red p-3 mb-4 rounded border border-netflix-red/50">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address" 
            className="p-3 bg-gray-800/70 border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
          />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password" 
            className="p-3 bg-gray-800/70 border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
          />

          {isSignUp && (
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="p-3 bg-gray-800/70 border border-gray-600 rounded text-white focus:outline-none focus:border-white transition appearance-none"
            >
              <option value="" disabled>Select your demographic...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-netflix-red text-white py-3 rounded font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Get Started' : 'Sign In')}
          </button>
        </form>

        <p className="mt-6 text-gray-400">
          {isSignUp ? 'Already have an account? ' : 'New to EmotionFlix? '}
          <span 
            className="text-white hover:underline cursor-pointer"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          >
            {isSignUp ? 'Sign in now.' : 'Sign up now.'}
          </span>
        </p>
      </div>
    </div>
  );
}