import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Flight, Airport, Airline } from '../types';

const searchSchema = z.object({
  from: z.string().min(3, 'Please select departure airport'),
  to: z.string().min(3, 'Please select arrival airport'),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(9),
  cabinClass: z.enum(['ECONOMY', 'BUSINESS', 'FIRST']),
});

const passengerSchema = z.object({
  title: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string(),
  passportNumber: z.string().optional(),
  nationality: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;
type PassengerFormData = z.infer<typeof passengerSchema>;

export default function Flights() {
  const { user } = useAuth();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);

  const {
    register: registerSearch,
    handleSubmit: handleSearchSubmit,
    formState: { errors: searchErrors },
    watch: watchSearch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      passengers: 1,
      cabinClass: 'ECONOMY',
    },
  });

  const {
    register: registerPassenger,
    handleSubmit: handlePassengerSubmit,
    formState: { errors: passengerErrors },
    reset: resetPassenger,
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
  });

  const { data: airports } = useQuery<Airport[]>(['airports'], async () => {
    const response = await axios.get('/api/flights/airports');
    return response.data;
  });

  const { data: airlines } = useQuery<Airline[]>(['airlines'], async () => {
    const response = await axios.get('/api/flights/airlines');
    return response.data;
  });

  const searchFlightsMutation = useMutation(
    async (data: SearchFormData) => {
      const response = await axios.post('/api/flights/search', data);
      return response.data;
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to search flights');
      },
    }
  );

  const bookFlightMutation = useMutation(
    async () => {
      if (!selectedFlight) return;

      const bookingData = {
        flightId: selectedFlight.id,
        passengers,
        totalAmount: selectedFlight.price * passengers.length,
      };

      const response = await axios.post('/api/flights/book', bookingData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Flight booked successfully!');
        // Redirect to payment page
        window.location.href = data.paymentUrl;
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to book flight');
      },
    }
  );

  const handleAddPassenger = (data: PassengerFormData) => {
    setPassengers([...passengers, data]);
    resetPassenger();

    if (passengers.length + 1 === watchSearch('passengers')) {
      setShowPassengerForm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Search Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Book Flights</h2>
        <form onSubmit={handleSearchSubmit((data) => searchFlightsMutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <select
                {...registerSearch('from')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select departure airport</option>
                {airports?.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code}) - {airport.name}
                  </option>
                ))}
              </select>
              {searchErrors.from && (
                <p className="mt-1 text-sm text-red-600">{searchErrors.from.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <select
                {...registerSearch('to')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select arrival airport</option>
                {airports?.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code}) - {airport.name}
                  </option>
                ))}
              </select>
              {searchErrors.to && (
                <p className="mt-1 text-sm text-red-600">{searchErrors.to.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Departure Date</label>
              <input
                type="date"
                {...registerSearch('departureDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
              {searchErrors.departureDate && (
                <p className="mt-1 text-sm text-red-600">{searchErrors.departureDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Return Date (Optional)</label>
              <input
                type="date"
                {...registerSearch('returnDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min={watchSearch('departureDate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Passengers</label>
              <input
                type="number"
                {...registerSearch('passengers')}
                min="1"
                max="9"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {searchErrors.passengers && (
                <p className="mt-1 text-sm text-red-600">{searchErrors.passengers.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cabin Class</label>
              <select
                {...registerSearch('cabinClass')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="ECONOMY">Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={searchFlightsMutation.isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {searchFlightsMutation.isLoading ? 'Searching...' : 'Search Flights'}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searchFlightsMutation.data && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Flights</h3>
          <div className="space-y-4">
            {searchFlightsMutation.data.map((flight: Flight) => {
              const airline = airlines?.find((a) => a.code === flight.airlineCode);
              return (
                <div
                  key={flight.id}
                  className={`border rounded-lg p-4 ${
                    selectedFlight?.id === flight.id ? 'border-indigo-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {airline && (
                        <img src={airline.logo} alt={airline.name} className="h-8 w-8 object-contain" />
                      )}
                      <div>
                        <p className="font-medium">{airline?.name}</p>
                        <p className="text-sm text-gray-500">Flight {flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">₦{flight.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{flight.seatsAvailable} seats left</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{flight.departureTime}</p>
                          <p className="text-sm text-gray-500">{flight.departureAirport}</p>
                        </div>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <div className="text-right">
                          <p className="font-medium">{flight.arrivalTime}</p>
                          <p className="text-sm text-gray-500">{flight.arrivalAirport}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowPassengerForm(true);
                      }}
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Passenger Details Form */}
      {showPassengerForm && selectedFlight && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Passenger {passengers.length + 1} of {watchSearch('passengers')}
          </h3>
          <form onSubmit={handlePassengerSubmit(handleAddPassenger)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <select
                  {...registerPassenger('title')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select title</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
                {passengerErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{passengerErrors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  {...registerPassenger('firstName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {passengerErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{passengerErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  {...registerPassenger('lastName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {passengerErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{passengerErrors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  {...registerPassenger('dateOfBirth')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {passengerErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{passengerErrors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                <input
                  type="text"
                  {...registerPassenger('passportNumber')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                <input
                  type="text"
                  {...registerPassenger('nationality')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowPassengerForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {passengers.length + 1 === watchSearch('passengers')
                  ? 'Complete Booking'
                  : 'Add Passenger'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Booking Summary */}
      {selectedFlight && passengers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Flight</span>
              <span>{selectedFlight.flightNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Passengers</span>
              <span>{passengers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per passenger</span>
              <span>₦{selectedFlight.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₦{(selectedFlight.price * passengers.length).toLocaleString()}</span>
            </div>

            <button
              onClick={() => bookFlightMutation.mutate()}
              disabled={bookFlightMutation.isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {bookFlightMutation.isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}