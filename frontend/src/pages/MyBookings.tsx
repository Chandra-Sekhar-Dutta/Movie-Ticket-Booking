import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useShow } from '../context/ShowContext';
import { useMovie } from '../context/MovieContext';
import { Loading, EmptyState, Alert } from '../components/UIElements';
import { formatDateTime, formatCurrency, getBookingStatusColor } from '../utils/helpers';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { Booking } from '../types';

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { bookings, isLoading, error, getUserBookings } = useBooking();
  const { getShowById } = useShow();
  const { getMovieById } = useMovie();
  const [enrichedBookings, setEnrichedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      getUserBookings(user.id);
    }
  }, [isAuthenticated, user, navigate, getUserBookings]);

  // Enrich bookings with movie and show details
  useEffect(() => {
    const enrichBookings = async () => {
      const enriched = await Promise.all(
        bookings.map(async (booking) => {
          try {
            let showData = null;
            let movieData = null;

            if (booking.showId) {
              showData = await getShowById(booking.showId);
            }

            if (showData?.movieId) {
              movieData = await getMovieById(showData.movieId);
            }

            return {
              ...booking,
              show: showData || undefined,
              movie: movieData || undefined,
            };
          } catch (err) {
            console.error('Error enriching booking:', err);
            return booking;
          }
        })
      );

      setEnrichedBookings(enriched);
    };

    if (bookings.length > 0) {
      enrichBookings();
    } else {
      setEnrichedBookings([]);
    }
  }, [bookings, getShowById, getMovieById]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="container">
          <h1 className="text-4xl font-bold">My Bookings</h1>
          <p className="text-gray-300 mt-2">View all your ticket bookings</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {error && <Alert type="error" message={error} />}

        {isLoading ? (
          <Loading text="Loading your bookings..." />
        ) : enrichedBookings.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="No Bookings Yet"
            description="You haven't booked any tickets yet. Start exploring now!"
            action={{ label: 'Browse Shows', onClick: () => navigate('/') }}
          />
        ) : (
          <div className="space-y-6">
            {enrichedBookings.map((booking) => (
              <div key={booking.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Booking Info */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                    <p className="font-bold text-lg text-primary">{booking.bookingReference}</p>
                  </div>

                  {/* Movie & Time */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Movie</p>
                    <p className="font-bold text-primary">
                      {booking.movie?.title || 'Unknown Movie'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {booking.show
                        ? formatDateTime(booking.show.date, booking.show.showTime)
                        : 'Date TBD'}
                    </p>
                  </div>

                  {/* Seats & Amount */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Seats Booked</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {(booking.seats || []).slice(0, 3).map((seat) => (
                        <span key={seat} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold">
                          {seat}
                        </span>
                      ))}
                      {(booking.seats || []).length > 3 && (
                        <span className="px-2 py-1 text-gray-600">
                          +{(booking.seats || []).length - 3} more
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-accent">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <div
                      className={`px-4 py-2 rounded-full font-semibold text-sm ${getBookingStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </div>
                    <button 
                      onClick={() => {
                        const movieName = booking.movie?.title || 'Movie';
                        const showDetails = booking.show 
                          ? `${new Date(booking.show.date).toLocaleDateString()} at ${booking.show.showTime}`
                          : 'Show TBD';
                        generateTicketPDF(booking, movieName, showDetails);
                      }}
                      className="text-accent hover:text-blue-700 flex items-center gap-1 mt-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
