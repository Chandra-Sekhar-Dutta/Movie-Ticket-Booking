import React from 'react';
import { Star, Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { Movie, Show } from '../types';
import { formatDate, formatTime, formatCurrency, truncateText } from '../utils/helpers';

interface MovieCardProps {
  movie: Movie;
  showCount?: number;
  onClick?: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showCount = 0,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="card-hover group overflow-hidden cursor-pointer h-full flex flex-col"
    >
      {/* Poster Image Container */}
      <div className="relative h-72 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/300x400?text=No+Image';
          }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        {movie.rating && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-secondary to-red-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform group-hover:scale-110 transition-transform">
            <Star className="w-4 h-4 fill-white text-white" />
            <span className="text-white font-bold text-sm">{movie.rating}/10</span>
          </div>
        )}

        {/* Hot/Trending Badge */}
        {showCount > 3 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-white font-bold text-xs">TRENDING</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg line-clamp-2 mb-2 text-primary group-hover:text-secondary transition-colors">
          {movie.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
          {truncateText(movie.description, 80)}
        </p>

        {/* Meta Information */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200">
              {movie.genre}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 font-medium">{movie.duration} mins</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
        </div>

        {/* Show Count */}
        {showCount > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-bold bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">
              {showCount} show{showCount !== 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ShowCardProps {
  show: Show;
  movie?: Movie;
  onClick?: () => void;
}

export const ShowCard: React.FC<ShowCardProps> = ({
  show,
  movie,
  onClick,
}) => {
  const seatPercentage = ((show.totalSeats - show.availableSeats) / show.totalSeats) * 100;
  const isLowAvailability = show.availableSeats <= 5;
  const isSoldOut = show.availableSeats === 0;

  return (
    <div
      onClick={onClick}
      className="card-interactive group"
    >
      <div className="flex flex-col sm:flex-row gap-5 h-full">
        {/* Movie Poster */}
        <div className="flex-shrink-0 w-full sm:w-28 h-40 sm:h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden border border-gray-200 group-hover:border-accent/50 transition-colors">
          {movie?.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie?.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/100x150?text=No+Image';
              }}
            />
          )}
        </div>

        {/* Show Details */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="font-bold text-lg text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2">
              {movie?.title || 'Movie'}
            </h3>

            <div className="space-y-3 text-sm">
              {/* Date and Time */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700">{formatDate(show.date)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-700">{formatTime(show.showTime)}</span>
                </div>
              </div>

              {/* Available Seats with Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">
                      {show.availableSeats}/{show.totalSeats} seats
                    </span>
                  </div>
                  {isSoldOut && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">SOLD OUT</span>
                  )}
                  {isLowAvailability && !isSoldOut && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">HURRY!</span>
                  )}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${seatPercentage}%` }}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Standard</p>
                  <p className="font-bold text-lg text-blue-600">
                    {formatCurrency(show.standardPrice)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Premium</p>
                  <p className="font-bold text-lg text-purple-600">
                    {formatCurrency(show.premiumPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button Area */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm font-bold text-center bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent group-hover:opacity-100">
              {isSoldOut ? '❌ Sold Out' : isLowAvailability ? '⚡ Limited Seats' : '✓ Available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
