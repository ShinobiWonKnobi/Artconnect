import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Image, Upload as UploadIcon, User, LogIn, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
            Art Gallery
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/" className="nav-link text-gray-600 dark:text-gray-300">
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link to="/gallery" className="nav-link text-gray-600 dark:text-gray-300">
                  <Image className="w-5 h-5" />
                  <span>Gallery</span>
                </Link>
                <Link to="/upload" className="nav-link text-gray-600 dark:text-gray-300">
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload</span>
                </Link>
                <Link to="/profile" className="nav-link text-gray-600 dark:text-gray-300">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/gallery" className="nav-link text-gray-600 dark:text-gray-300">
                  <Image className="w-5 h-5" />
                  <span>Gallery</span>
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link to="/login" className="nav-link text-gray-600 dark:text-gray-300">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}