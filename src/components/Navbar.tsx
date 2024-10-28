import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Image, Upload, User } from 'lucide-react';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            ArtGallery
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/gallery" className="nav-link">
              <Image className="w-5 h-5" />
              <span>Gallery</span>
            </Link>
            
            {user ? (
              <>
                <Link to="/upload" className="nav-link">
                  <Upload className="w-5 h-5" />
                  <span>Upload</span>
                </Link>
                <Link to="/profile" className="nav-link">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}