import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Loading, EmptyState } from '../components/UIElements';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Movie, Show } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';

// Admin Dashboard
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'movies' | 'shows'>('movies');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && (user as any).role !== 'admin') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return <Loading fullPage text="Checking authentication..." />;
  }

  // Show access denied if not admin
  if (user && (user as any).role !== 'admin') {
    return (
      <EmptyState
        icon="🔒"
        title="Access Denied"
        description="You need admin privileges to access this page."
        action={{ label: 'Go Home', onClick: () => navigate('/') }}
      />
    );
  }

  const handleError = (message: string) => {
    setError(message);
    setSuccess(null);
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      <div className="bg-primary text-white py-8">
        <div className="container">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage movies and shows</p>
          <p className="text-gray-400 text-sm mt-1">Welcome, {user?.firstName || 'Admin'}!</p>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert type="success" title="Success" message={success} onClose={() => setSuccess(null)} />
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'movies'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab('shows')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'shows'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Shows
          </button>
        </div>

        {/* Content */}
        {activeTab === 'movies' && (
          <MovieManagement onError={handleError} onSuccess={handleSuccess} />
        )}
        {activeTab === 'shows' && (
          <ShowManagement onError={handleError} onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
};

interface MovieManagementProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const MovieManagement: React.FC<MovieManagementProps> = ({ onError, onSuccess }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration_minutes: '',
    release_date: '',
    poster_url: '',
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMovies({});
      setMovies(response.data || []);
    } catch (err: any) {
      console.error('Error loading movies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.genre || !formData.duration_minutes) {
      onError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.createMovie({
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        rating: 8.0,
        duration_minutes: parseInt(formData.duration_minutes),
        poster_url: formData.poster_url,
        release_date: formData.release_date,
      });

      onSuccess('Movie created successfully!');
      setFormData({
        title: '',
        description: '',
        genre: '',
        duration_minutes: '',
        release_date: '',
        poster_url: '',
      });
      setIsAdding(false);
      await loadMovies();
    } catch (err: any) {
      onError(err.response?.data?.error?.message || 'Failed to create movie');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (movieId: string) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      setIsLoading(true);
      await apiClient.deleteMovie(movieId);
      onSuccess('Movie deleted successfully!');
      await loadMovies();
    } catch (err: any) {
      onError(err.response?.data?.error?.message || 'Failed to delete movie');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Manage Movies</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </button>
      </div>

      {isAdding && (
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-bold text-primary mb-4">Add New Movie</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Movie title"
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Genre *</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g., Action, Drama, Comedy"
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Duration (minutes) *</label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="e.g., 120"
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Release Date</label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="input-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Movie description"
                rows={3}
                className="input-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Poster URL</label>
              <input
                type="url"
                name="poster_url"
                value={formData.poster_url}
                onChange={handleChange}
                placeholder="https://..."
                className="input-base"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Add Movie'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
                className="btn btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <Loading text="Loading movies..." />}

      {!isLoading && movies.length === 0 ? (
        <EmptyState
          icon="🎬"
          title="No Movies Yet"
          description="Create your first movie to get started"
          action={{ label: 'Add Movie', onClick: () => setIsAdding(true) }}
        />
      ) : (
        <div className="grid gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="card p-4 flex items-center gap-4">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-20 h-32 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-primary">{movie.title}</h3>
                <p className="text-sm text-gray-600">{movie.genre}</p>
                <p className="text-xs text-gray-500 mt-1">{movie.duration} min</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(movie.id)}
                  disabled={isLoading}
                  className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ShowManagementProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const ShowManagement: React.FC<ShowManagementProps> = ({ onError, onSuccess }) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    movie_id: '',
    show_date: '',
    show_time: '',
    total_seats: '',
    price_standard: '',
    price_premium: '',
  });

  useEffect(() => {
    loadShowsAndMovies();
  }, []);

  const loadShowsAndMovies = async () => {
    try {
      setIsLoading(true);
      const [showsResponse, moviesResponse] = await Promise.all([
        apiClient.getUpcomingShows(),
        apiClient.getMovies({}),
      ]);

      setShows(showsResponse.data || []);
      setMovies(moviesResponse.data || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.movie_id ||
      !formData.show_date ||
      !formData.show_time ||
      !formData.total_seats ||
      !formData.price_standard ||
      !formData.price_premium
    ) {
      onError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.createShow({
        movie_id: parseInt(formData.movie_id),
        show_date: formData.show_date,
        show_time: formData.show_time,
        screen_name: 'Screen 1',
        total_seats: parseInt(formData.total_seats),
        price_standard: parseFloat(formData.price_standard),
        price_premium: parseFloat(formData.price_premium),
      });

      onSuccess('Show created successfully!');
      setFormData({
        movie_id: '',
        show_date: '',
        show_time: '',
        total_seats: '',
        price_standard: '',
        price_premium: '',
      });
      setIsAdding(false);
      await loadShowsAndMovies();
    } catch (err: any) {
      onError(err.response?.data?.error?.message || 'Failed to create show');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShow = async (showId: string) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;

    try {
      setIsLoading(true);
      await apiClient.deleteShow(showId);
      onSuccess('Show deleted successfully!');
      await loadShowsAndMovies();
    } catch (err: any) {
      onError(err.response?.data?.error?.message || 'Failed to delete show');
    } finally {
      setIsLoading(false);
    }
  };

  const getMovieTitle = (movieId: number) => {
    return movies.find((m) => m.id === movieId)?.title || 'Unknown Movie';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Manage Shows</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Show
        </button>
      </div>

      {isAdding && (
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-bold text-primary mb-4">Add New Show</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Movie *</label>
              <select
                name="movie_id"
                value={formData.movie_id}
                onChange={handleChange}
                className="input-base"
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                name="show_date"
                value={formData.show_date}
                onChange={handleChange}
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Show Time *</label>
              <input
                type="time"
                name="show_time"
                value={formData.show_time}
                onChange={handleChange}
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Total Seats *</label>
              <input
                type="number"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleChange}
                placeholder="e.g., 120"
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Standard Price *</label>
              <input
                type="number"
                step="0.01"
                name="price_standard"
                value={formData.price_standard}
                onChange={handleChange}
                placeholder="e.g., 150"
                className="input-base"
              />
            </div>
            <div>
              <label className="label">Premium Price *</label>
              <input
                type="number"
                step="0.01"
                name="price_premium"
                value={formData.price_premium}
                onChange={handleChange}
                placeholder="e.g., 250"
                className="input-base"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={isLoading || movies.length === 0}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Add Show'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
                className="btn btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {movies.length === 0 && (
              <div className="md:col-span-2 p-3 bg-orange-50 border border-orange-200 rounded flex gap-2 text-sm text-orange-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Please create at least one movie before adding shows</span>
              </div>
            )}
          </form>
        </div>
      )}

      {isLoading && <Loading text="Loading shows..." />}

      {!isLoading && shows.length === 0 ? (
        <EmptyState
          icon="🎭"
          title="No Shows Yet"
          description="Create shows for your movies to get started"
          action={{ label: 'Add Show', onClick: () => setIsAdding(true) }}
        />
      ) : (
        <div className="grid gap-4">
          {shows.map((show) => (
            <div key={show.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-primary">{getMovieTitle(show.movieId)}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(show.date, show.showTime)}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span>📊 {show.availableSeats}/{show.totalSeats} seats</span>
                    <span>💰 {formatCurrency(show.standardPrice)} / {formatCurrency(show.premiumPrice)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteShow(show.id)}
                    disabled={isLoading}
                    className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
