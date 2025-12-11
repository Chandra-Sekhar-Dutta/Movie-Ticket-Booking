import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { Loading, EmptyState, Alert } from '../components/UIElements';
import { useShow } from '../context/ShowContext';
import { useBooking } from '../context/BookingContext';
import { useMovie } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { usePolling } from '../hooks/usePolling';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import { apiClient } from '../services/api';

export const Booking: React.FC = () => {
  const { id: showId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedShow, getShowById, isLoading: showLoading } = useShow();
  const { movies } = useMovie();
  const {
    selectedSeats,
    toggleSeatSelection,
    bookSeats,
    isLoading: bookingLoading,
    error: bookingError,
  } = useBooking();
  const { isAuthenticated } = useAuth();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [seatLayout, setSeatLayout] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Poll ONLY seat availability without refreshing the entire page
  const pollSeatsOnly = useCallback(async () => {
    if (showId && isAuthenticated && seatLayout) {
      try {
        // Fetch only the show with seats (minimal data fetch)
        const response = await apiClient.getShowWithSeats(showId);
        const updatedShow = response.data;

        if (updatedShow?.seats) {
          // Update only the seat availability in the layout
          const updatedLayout: any = { ...seatLayout };
          
          updatedShow.seats.forEach((seat: any) => {
            const row = seat.row;
            if (updatedLayout[row]) {
              const seatIndex = updatedLayout[row].findIndex((s: any) => s.id === seat.id.toString());
              if (seatIndex !== -1) {
                updatedLayout[row][seatIndex].isAvailable = !seat.isBooked;
              }
            }
          });

          setSeatLayout(updatedLayout);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error('Error polling seat availability:', err);
      }
    }
  }, [showId, isAuthenticated, seatLayout]);

  // Polling for live seat availability updates (every 5 seconds)
  usePolling(pollSeatsOnly, {
    interval: 5000, // Poll every 5 seconds
    enabled: isAuthenticated && !!showId && !bookingSuccess && !!seatLayout, // Stop polling after successful booking
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (showId) {
      getShowById(showId);
    }
  }, [showId, isAuthenticated]);

  // Mock seat layout generation
  useEffect(() => {
    if (selectedShow) {
      generateSeatLayout();
    }
  }, [selectedShow]);

  const generateSeatLayout = () => {
    // Use real seats from the backend if available
    if (selectedShow?.seats && selectedShow.seats.length > 0) {
      const layout: any = {};
      
      selectedShow.seats.forEach((seat: any) => {
        const row = seat.row;
        if (!layout[row]) {
          layout[row] = [];
        }
        
        // Determine the price based on seat type - ensure it's always a number
        const seatPrice = seat.seatType === 'premium' 
          ? (selectedShow?.premiumPrice ?? 0)
          : (selectedShow?.standardPrice ?? 0);
        
        layout[row].push({
          id: seat.id.toString(), // Convert to string for consistency
          row,
          number: seat.column,
          type: seat.seatType,
          isAvailable: !seat.isBooked,
          price: typeof seatPrice === 'number' ? seatPrice : parseInt(seatPrice) || 0,
        });
      });
      
      // Sort seats in each row by column number
      Object.keys(layout).forEach(row => {
        layout[row].sort((a: any, b: any) => a.number - b.number);
      });
      
      setSeatLayout(layout);
    } else {
      // Fallback to mock layout if no real seats available
      const rows = 10;
      const seatsPerRow = 12;
      const layout: any = {};

      // Ensure prices are always numbers
      const standardPrice = typeof selectedShow?.standardPrice === 'number' 
        ? selectedShow.standardPrice 
        : parseInt(String(selectedShow?.standardPrice)) || 300;
      const premiumPrice = typeof selectedShow?.premiumPrice === 'number'
        ? selectedShow.premiumPrice
        : parseInt(String(selectedShow?.premiumPrice)) || 500;

      for (let i = 0; i < rows; i++) {
        const row = String.fromCharCode(65 + i); // A, B, C, etc.
        layout[row] = [];

        for (let j = 1; j <= seatsPerRow; j++) {
          const seatId = `${row}${j}`;
          const seatType = i < 3 ? 'premium' : 'standard';
          layout[row].push({
            id: seatId,
            row,
            number: j,
            type: seatType,
            isAvailable: Math.random() > 0.3, // 70% seats available
            price: seatType === 'premium' ? premiumPrice : standardPrice,
          });
        }
      }

      setSeatLayout(layout);
    }
  };

  const handleSeatClick = (seatId: string) => {
    // Find the seat in the layout regardless of ID format
    for (const row in seatLayout) {
      const seat = seatLayout[row]?.find((s: any) => s.id === seatId);
      if (seat && seat.isAvailable) {
        toggleSeatSelection(seatId);
        return;
      }
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      // Show error message
      console.error('Please select at least one seat');
      return;
    }

    if (!showId) {
      // Show error message
      console.error('Show ID is missing');
      return;
    }

    try {
      const booking = await bookSeats({
        showId,
        seatIds: selectedSeats,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        // Use the returned booking object instead of currentBooking from context
        if (booking?.id) {
          navigate(`/booking-confirmation/${booking.id}`);
        } else {
          console.error('Booking ID not available');
          navigate('/my-bookings');
        }
      }, 2000);
    } catch (err: any) {
      console.error('Booking error:', err);
    }
  };

  const getTotalPrice = (): number => {
    if (!seatLayout) return 0;
    
    let total = 0;
    selectedSeats.forEach((seatId) => {
      // Find the seat in the layout
      for (const row in seatLayout) {
        const seat = seatLayout[row]?.find((s: any) => s.id === seatId);
        if (seat && seat.price !== undefined && seat.price !== null) {
          total += seat.price;
          break; // Exit inner loop once found
        }
      }
    });
    return total;
  };

  if (showLoading) {
    return <Loading fullPage text="Loading show details..." />;
  }

  if (!selectedShow) {
    return (
      <EmptyState
        icon="❌"
        title="Show Not Found"
        description="The show you're looking for doesn't exist."
        action={{ label: 'Go Back', onClick: () => navigate('/') }}
      />
    );
  }

  const movie = movies.find((m) => m.id === selectedShow.movieId);

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold">{movie?.title}</h1>
          <p className="text-gray-300 mt-1">
            {formatDateTime(selectedShow.date, selectedShow.showTime)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              {bookingSuccess && (
                <Alert
                  type="success"
                  title="Booking Successful!"
                  message="Your booking has been confirmed. Redirecting to confirmation..."
                />
              )}

              {bookingError && (
                <Alert
                  type="error"
                  title="Booking Error"
                  message={bookingError}
                  onClose={() => {}} // Error will auto-clear from context
                />
              )}

              <h2 className="text-2xl font-bold text-primary mb-6">Select Seats</h2>

              {/* Live Update Indicator */}
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-800">
                    Seat availability updated in real-time
                  </span>
                </div>
                {lastUpdated && (
                  <span className="text-xs text-blue-600">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Screen */}
              <div className="mb-8">
                <div className="bg-gray-800 text-white py-3 rounded-full text-center font-bold tracking-widest mb-8">
                  SCREEN
                </div>

                {/* Seat Layout */}
                {seatLayout && (
                  <div className="space-y-2">
                    {Object.entries(seatLayout).map(([row, seats]: [string, any]) => (
                      <div key={row} className="flex items-center gap-4">
                        <div className="w-8 font-bold text-center text-gray-700">
                          {row}
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center flex-1">
                          {seats.map((seat: any) => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={!seat.isAvailable}
                              className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                                !seat.isAvailable
                                  ? 'bg-gray-300 text-white cursor-not-allowed'
                                  : selectedSeats.includes(seat.id)
                                  ? 'bg-secondary text-white ring-2 ring-secondary ring-offset-2 scale-110 transition-transform'
                                  : seat.type === 'premium'
                                  ? 'bg-yellow-400 text-black hover:bg-yellow-500 hover:scale-105 transition-all'
                                  : 'bg-blue-400 text-white hover:bg-blue-500 hover:scale-105 transition-all'
                              }`}
                              title={`Seat ${seat.id} - ${formatCurrency(seat.price)}`}
                            >
                              {selectedSeats.includes(seat.id) ? (
                                <Check className="w-4 h-4 mx-auto" />
                              ) : (
                                ''
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div className="mt-8 pt-8 border-t border-gray-200 flex gap-6 justify-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded" />
                    <span className="text-sm text-gray-700">Premium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-400 rounded" />
                    <span className="text-sm text-gray-700">Standard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-secondary rounded ring-2 ring-secondary ring-offset-2" />
                    <span className="text-sm text-gray-700">Selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="text-xl font-bold text-primary mb-4">Booking Summary</h3>

              {/* Movie Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Movie</p>
                <p className="font-bold text-primary">{movie?.title}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatDateTime(selectedShow.date, selectedShow.showTime)}
                </p>
              </div>

              {/* Selected Seats */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Selected Seats</p>
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-500 italic">No seats selected</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {selectedSeats
                      .sort((a, b) => a.localeCompare(b))
                      .map((seatId) => (
                        <button
                          key={seatId}
                          onClick={() => toggleSeatSelection(seatId)}
                          className="px-3 py-1 bg-secondary text-white rounded hover:bg-red-600 text-sm font-medium flex items-center gap-2"
                        >
                          {seatId}
                          <span className="text-xs">×</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              {selectedSeats.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Price Breakdown</p>
                  <div className="space-y-2 text-sm">
                    {selectedSeats.map((seatId) => {
                      // Search all rows to find the seat
                      let seat = null;
                      for (const row in seatLayout) {
                        const foundSeat = seatLayout?.[row]?.find((s: any) => s.id === seatId);
                        if (foundSeat) {
                          seat = foundSeat;
                          break;
                        }
                      }
                      
                      return (
                        <div key={seatId} className="flex justify-between">
                          <span className="text-gray-700">
                            Seat {seatId} ({seat?.type || 'unknown'})
                          </span>
                          <span className="font-bold text-primary">
                            {formatCurrency(seat?.price || 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">Total Amount</span>
                  <span className="text-2xl font-bold text-secondary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || bookingLoading}
                className="w-full btn btn-primary btn-lg font-bold disabled:opacity-50"
              >
                {bookingLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="loading-spinner" />
                    Booking...
                  </span>
                ) : (
                  `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your booking will be held for 2 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
