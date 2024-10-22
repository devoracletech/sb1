import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { CryptoRate } from '../types';

const tradeSchema = z.object({
  type: z.enum(['BTC', 'ETH', 'USDT']),
  amount: z.number().min(0.0001),
  action: z.enum(['BUY', 'SELL']),
});

type TradeFormData = z.infer<typeof tradeSchema>;

export default function Crypto() {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<'BUY' | 'SELL'>('BUY');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'USDT' | null>(null);

  const { data: rates } = useQuery<CryptoRate[]>(['crypto-rates'], async () => {
    const response = await axios.get('/api/crypto/rates');
    return response.data;
  });

  const { data: addresses, refetch: refetchAddresses } = useQuery(
    ['crypto-addresses'],
    async () => {
      const response = await axios.get('/api/crypto/addresses');
      return response.data;
    }
  );

  const generateAddressMutation = useMutation(
    async (type: string) => {
      const response = await axios.post('/api/crypto/generate-address', { type });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Crypto address generated successfully');
        refetchAddresses();
        setShowAddressModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to generate address');
      },
    }
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
  });

  const selectedType = watch('type');
  const selectedAmount = watch('amount');

  const tradeMutation = useMutation(
    async (data: TradeFormData) => {
      const response = await axios.post('/api/crypto/trade', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success(`Crypto ${selectedAction.toLowerCase()} order placed successfully`);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Trade failed');
      },
    }
  );

  const calculateNairaAmount = () => {
    if (!selectedType || !selectedAmount || !rates) return 0;
    const rate = rates.find((r) => r.type === selectedType);
    if (!rate) return 0;
    return selectedAmount * (selectedAction === 'BUY' ? rate.buyRate : rate.sellRate);
  };

  if (user?.kycStatus !== 'VERIFIED') {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">KYC Required</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please complete your KYC verification to access crypto trading features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Crypto Addresses Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Crypto Addresses</h2>
          <button
            onClick={() => setShowAddressModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate New Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addresses?.map((address) => (
            <div key={address.type} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">{address.type}</h3>
              <p className="text-sm text-gray-500 break-all mt-1">{address.address}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address.address);
                  toast.success('Address copied to clipboard');
                }}
                className="mt-2 text-indigo-600 text-sm hover:text-indigo-700"
              >
                Copy Address
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Crypto Trading</h2>

        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedAction('BUY')}
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedAction === 'BUY'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSelectedAction('SELL')}
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedAction === 'SELL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Rates</h3>
          <div className="grid grid-cols-3 gap-4">
            {rates?.map((rate) => (
              <div key={rate.type} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{rate.type}</h4>
                <p className="text-sm text-gray-500">
                  Buy: ₦{rate.buyRate.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Sell: ₦{rate.sellRate.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => tradeMutation.mutate({ ...data, action: selectedAction }))} className="space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Cryptocurrency
            </label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select cryptocurrency</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.0001"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {selectedType && selectedAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Estimated Amount in Naira:
                <span className="ml-2 font-medium">
                  ₦{calculateNairaAmount().toLocaleString()}
                </span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={tradeMutation.isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {tradeMutation.isLoading ? 'Processing...' : `${selectedAction} Crypto`}
          </button>
        </form>
      </div>

      {/* Address Generation Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Cryptocurrency
                </label>
                <select
                  value={selectedCrypto || ''}
                  onChange={(e) => setSelectedCrypto(e.target.value as 'BTC' | 'ETH' | 'USDT')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select cryptocurrency</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedCrypto && generateAddressMutation.mutate(selectedCrypto)}
                  disabled={!selectedCrypto || generateAddressMutation.isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {generateAddressMutation.isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}