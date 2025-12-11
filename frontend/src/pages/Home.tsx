import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Film, Zap, Star, Shield, Zap as ZapIcon, ArrowRight } from 'lucide-react';
import { ShowCard } from '../components/Cards';
import { Loading, EmptyState } from '../components/UIElements';
import { useShow } from '../context/ShowContext';
import { useMovie } from '../context/MovieContext';
import { Show } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { shows, isLoading: showsLoading, fetchUpcomingShows } = useShow();
  const { movies, fetchMovies } = useMovie();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);

  useEffect(() => {
    fetchMovies();
    fetchUpcomingShows();
  }, []);

  // Filter shows by selected date
  useEffect(() => {
    if (selectedDate) {
      setFilteredShows(shows.filter((show) => show.date === selectedDate));
    } else {
      setFilteredShows(shows);
    }
  }, [selectedDate, shows]);

  const getMovieForShow = (movieId: string) => {
    return movies.find((m) => m.id === movieId);
  };

  const getUniqueDates = (): string[] => {
    const dates = new Set(shows.map((s) => s.date));
    return Array.from(dates).sort();
  };

  const uniqueDates = getUniqueDates();

  return (
    <div className="min-h-screen bg-gradient-to-b from-light via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-red-400/20 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">Welcome to BookMyShow</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 leading-tight">
              Book Your Favorite Movies & Shows
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
              Discover upcoming shows, select your preferred seats, and book instantly. Experience cinema like never before.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/movies')}
                className="btn btn-primary btn-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Film className="w-5 h-5" />
                Explore All Movies
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="btn btn-outline btn-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                My Bookings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Shows Section */}
      <section className="py-16">
        <div className="container">
          {/* Section Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-accent to-blue-600 rounded-full"></div>
              <h2 className="text-4xl font-bold text-primary">Upcoming Shows</h2>
            </div>
            <p className="text-gray-600 font-medium">Browse and book your favorite shows today</p>
          </div>

          {/* Date Filter */}
          {uniqueDates.length > 0 && (
            <div className="mb-10 overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-2 flex-nowrap">
                <button
                  onClick={() => setSelectedDate(null)}
                  className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-bold transition-all duration-300 ${
                    selectedDate === null
                      ? 'bg-gradient-to-r from-accent to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-accent hover:bg-blue-50'
                  }`}
                >
                  All Dates
                </button>
                {uniqueDates.slice(0, 7).map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-bold transition-all duration-300 ${
                      selectedDate === date
                        ? 'bg-gradient-to-r from-accent to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-accent hover:bg-blue-50'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shows Grid */}
          {showsLoading ? (
            <Loading text="Loading shows..." />
          ) : filteredShows.length === 0 ? (
            <EmptyState
              icon="🎬"
              title="No Shows Available"
              description={
                selectedDate
                  ? 'No shows available for the selected date. Please try another date.'
                  : 'No shows available at the moment. Please check back later.'
              }
              action={{
                label: 'Explore All Movies',
                onClick: () => navigate('/movies'),
              }}
            />
          ) : (
            <div className="grid gap-6">
              {filteredShows.map((show) => {
                const movie = getMovieForShow(show.movieId);
                return (
                  <ShowCard
                    key={show.id}
                    show={show}
                    movie={movie}
                    onClick={() => navigate(`/booking/${show.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Book With Us</h2>
            <p className="text-gray-300 text-lg">Experience the best movie booking platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ZapIcon,
                title: 'Instant Booking',
                description: 'Book your tickets in seconds with our fast and reliable system',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Shield,
                title: 'Secure Payment',
                description: 'Your transactions are 100% secure with encrypted payments',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Star,
                title: 'Best Selection',
                description: 'Interactive seat selection with real-time availability',
                color: 'from-amber-500 to-orange-500',
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group">
                  <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-0.5 h-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
                    <div className="bg-slate-900 rounded-2xl p-8 h-full flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-400 font-medium">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="bg-gradient-to-r from-accent via-blue-600 to-accent rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
            <h3 className="text-4xl font-bold mb-4">Ready to Book Your Tickets?</h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Browse thousands of movies and shows, select your favorite seats, and complete your booking in just a few clicks.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="btn btn-secondary btn-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
