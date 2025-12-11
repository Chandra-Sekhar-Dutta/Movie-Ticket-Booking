import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Loading, EmptyState } from '../components/UIElements';
import { useShow } from '../context/ShowContext';
import { apiClient } from '../services/api';
import { Movie } from '../types';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shows } = useShow();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        if (!id) {
          setError('Movie ID not provided');
          return;
        }
        const response = await apiClient.getMovieById(id);
        setMovie(response.data || null);
      } catch (err: any) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const movieShows = movie ? shows.filter((show) => show.movieId === movie.id) : [];

  if (isLoading) {
    return <Loading fullPage text="Loading movie details..." />;
  }

  if (error || !movie) {
    return (
      <EmptyState
        icon="🎬"
        title="Movie Not Found"
        description={error || 'The movie you are looking for does not exist.'}
        action={{ label: 'Back to Movies', onClick: () => navigate('/movies') }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Back Button */}
      <div className="bg-primary text-white py-4">
        <div className="container">
          <button
            onClick={() => navigate('/movies')}
            className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Movies
          </button>
        </div>
      </div>

      {/* Movie Header */}
      <div className="bg-gradient-to-r from-primary to-gray-800 text-white py-8">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Poster */}
            <div className="md:col-span-1">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/300x450?text=No+Image';
                }}
              />
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Rating</p>
                    <p className="text-xl font-bold">
                      {movie.rating ? `${movie.rating}/10` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-300">Duration</p>
                    <p className="text-xl font-bold">{movie.duration} mins</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded">
                      {movie.genre}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p className="text-gray-200 leading-relaxed">{movie.description}</p>
              </div>

              {/* Release Date */}
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-5 h-5" />
                <p>
                  Released:{' '}
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shows Section */}
      <div className="container py-12">
        <h2 className="text-3xl font-bold text-primary mb-6">Available Shows</h2>

        {movieShows.length === 0 ? (
          <EmptyState
            icon="🎭"
            title="No Shows Available"
            description="There are no shows available for this movie right now. Check back later!"
            action={{ label: 'Browse Other Movies', onClick: () => navigate('/movies') }}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movieShows.map((show) => (
              <div key={show.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(show.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-2xl font-bold text-primary">{show.showTime}</p>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Seats:</span>
                    <span className="font-semibold">{show.availableSeats}/{show.totalSeats}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Standard:</span>
                    <span className="font-semibold">₹{show.standardPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Premium:</span>
                    <span className="font-semibold">₹{show.premiumPrice}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/booking/${show.id}`)}
                  disabled={show.availableSeats === 0}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {show.availableSeats === 0 ? 'House Full' : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
