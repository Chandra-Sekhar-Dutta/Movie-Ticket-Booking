import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Download, Share2 } from 'lucide-react';
import { Loading } from '../components/UIElements';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useShow } from '../context/ShowContext';
import { useMovie } from '../context/MovieContext';
import { Booking } from '../types';

export const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { currentBooking, getBooking, isLoading } = useBooking();
  const { getShowById } = useShow();
  const { getMovieById } = useMovie();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [movieTitle, setMovieTitle] = useState<string>('');
  const [showDetails, setShowDetails] = useState<string>('');
  const loadedRef = useRef(false);
  const detailsLoadedRef = useRef(false);
  const confirmedRef = useRef(false);
  const { confirmBooking } = useBooking();

  // First effect: Load the booking (only once)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Only load if we haven't loaded yet
    if (loadedRef.current) {
      return;
    }

    const loadBooking = async () => {
      try {
        let bookingData: Booking | null = null;
        
        if (id) {
          bookingData = await getBooking(id);
        } else if (currentBooking) {
          bookingData = currentBooking;
        }

        if (bookingData) {
          setBooking(bookingData);
          loadedRef.current = true;
        }
      } catch (err) {
        console.error('Error loading booking:', err);
      }
    };

    loadBooking();
  }, [id, isAuthenticated, navigate, getBooking, currentBooking]);

  // Second effect: Load show and movie details (only once)
  useEffect(() => {
    if (!booking || !booking.showId || detailsLoadedRef.current) {
      return;
    }

    const loadDetails = async () => {
      try {
        const showData = await getShowById(booking.showId);
        if (showData) {
          setShowDetails(formatDateTime(showData.date, showData.showTime));
          
          if (showData.movieId) {
            const movieData = await getMovieById(showData.movieId);
            if (movieData) {
              setMovieTitle(movieData.title);
            }
          }
        }
        detailsLoadedRef.current = true;
      } catch (err) {
        console.error('Error loading show/movie details:', err);
      }
    };

    loadDetails();
  }, [booking?.showId, getShowById, getMovieById]);

  // Third effect: Confirm the booking (auto-confirm when loaded)
  useEffect(() => {
    if (!booking || booking.status === 'CONFIRMED' || confirmedRef.current) {
      return;
    }

    const confirmTheBooking = async () => {
      try {
        await confirmBooking(booking.id);
        setBooking((prev) => prev ? { ...prev, status: 'CONFIRMED' } : null);
        confirmedRef.current = true;
      } catch (err) {
        console.error('Error confirming booking:', err);
        // Don't stop the user from seeing confirmation page even if confirm fails
        confirmedRef.current = true;
      }
    };

    confirmTheBooking();
  }, [booking?.id, booking?.status, confirmBooking]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading || !booking) {
    return <Loading text="Loading booking confirmation..." />;
  }

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-12">
        <div className="container text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Booking Confirmed!</h1>
          <p className="text-green-100 mt-2">Your tickets have been successfully booked</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Confirmation Card */}
          <div className="card p-8 mb-8">
            {/* Booking Reference */}
            <div className="text-center mb-8 pb-8 border-b border-gray-200">
              <p className="text-gray-600 mb-2">Booking Reference</p>
              <p className="text-3xl font-bold text-primary">{booking.bookingReference}</p>
              <p className="text-sm text-gray-500 mt-2">Save this for your records</p>
            </div>

            {/* Movie Info */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-lg text-primary mb-4">Booking Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Movie</p>
                  <p className="font-semibold text-primary">{movieTitle || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-primary">{showDetails || 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-lg text-primary mb-4">Seats Booked</h3>
              <div className="flex gap-3">
                {booking.seats.map((seat) => (
                  <div
                    key={seat}
                    className="px-4 py-3 bg-secondary text-white rounded-lg font-semibold text-center"
                  >
                    {seat}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-lg text-primary mb-4">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>{booking.totalSeats} Seats</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Convenience Fee</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-primary border-t border-gray-200 pt-2 mt-2">
                  <span>Total Amount</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                ✓ {booking.status}
              </div>
            </div>

            {/* Important Notes */}
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900 mb-2">Important Notes</p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Please arrive 15 minutes before the show</li>
                <li>• Keep your booking reference handy</li>
                <li>• Entry is only with valid ticket & ID</li>
                <li>• Cancellation is allowed up to 1 hour before show</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => {
                  generateTicketPDF(booking, movieTitle || 'Movie', showDetails || 'Show TBD');
                }}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Ticket (PDF)
              </button>
              <button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/ticket/${booking.bookingReference}`;
                  const shareText = `Check out my booking! Booking Reference: ${booking.bookingReference}`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'BookMyShow Ticket',
                      text: shareText,
                      url: shareUrl,
                    }).catch(() => {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard!');
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(shareUrl);
                    alert('Shareable link copied to clipboard!\n' + shareUrl);
                  }
                }}
                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Link
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/')} className="btn btn-secondary btn-lg">
              Back to Home
            </button>
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary btn-lg">
              View All Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
