import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import { MovieCard } from '../components/Cards';
import { Loading, EmptyState } from '../components/UIElements';
import { useMovie } from '../context/MovieContext';
import { useShow } from '../context/ShowContext';
import { debounce } from '../utils/helpers';

export const Movies: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredMovies,
    isLoading: moviesLoading,
    fetchMovies,
    searchMovies,
    filterByGenre,
  } = useMovie();
  const { shows } = useShow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => searchMovies(query), 300),
    [searchMovies]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    filterByGenre(genre);
  };

  const getShowCountForMovie = (movieId: string): number => {
    return shows.filter((show) => show.movieId === movieId).length;
  };

  // Get unique genres
  const uniqueGenres = useMemo(() => {
    const genres = new Set(filteredMovies.map((m) => m.genre));
    return Array.from(genres).sort();
  }, [filteredMovies]);

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-gray-800 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Browse Movies</h1>
          <p className="text-gray-300">
            Find your favorite movies and book your tickets now
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-bold text-primary mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="label">Search Movies</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search..."
                    className="input-base pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Genre Filter */}
              <div className="mb-6">
                <label className="label mb-3">Genre</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleGenreChange('')}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedGenre === ''
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Genres
                  </button>
                  {uniqueGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreChange(genre)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedGenre === genre
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="mb-4">
                <label className="label mb-3">View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 text-center">
                {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {/* Movies Grid/List */}
          <div className="lg:col-span-3">
            {moviesLoading ? (
              <Loading text="Loading movies..." />
            ) : filteredMovies.length === 0 ? (
              <EmptyState
                icon="🎬"
                title="No Movies Found"
                description="Try adjusting your search filters or check back later for new movies."
              />
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    showCount={getShowCountForMovie(movie.id)}
                    onClick={() => {
                      navigate(`/movies/${movie.id}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMovies.map((movie) => {
                  const showCount = getShowCountForMovie(movie.id);
                  return (
                    <div
                      key={movie.id}
                      onClick={() => {
                        navigate(`/movies/${movie.id}`);
                      }}
                      className="card p-4 cursor-pointer hover:shadow-lg transition-shadow flex gap-4"
                    >
                      <div className="w-24 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/100x150?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-primary mb-2">
                          {movie.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {movie.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {movie.genre}
                          </span>
                          <span className="text-gray-500">{movie.duration} mins</span>
                          <span className="text-accent font-semibold">
                            {showCount} show{showCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movies;
