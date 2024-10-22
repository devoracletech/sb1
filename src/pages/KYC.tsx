import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const kycSchema = z.object({
  bvn: z.string().length(11, 'BVN must be 11 digits'),
  idType: z.enum(['NIN', 'PASSPORT', 'DRIVERS_LICENSE']),
  idNumber: z.string().min(5, 'ID number is required'),
  address: z.string().min(10, 'Please enter your full address'),
  dateOfBirth: z.string(),
  phoneNumber: z.string().regex(/^[0-9]{11}$/, 'Phone number must be 11 digits'),
});

type KYCFormData = z.infer<typeof kycSchema>;

export default function KYC() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
  });

  const kycMutation = useMutation(
    async (data: KYCFormData) => {
      const response = await axios.post('/api/kyc/verify', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('KYC verification submitted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'KYC verification failed');
      },
    }
  );

  if (user?.kycStatus === 'VERIFIED') {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900">KYC Verified</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your identity has been verified. You have full access to all features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">KYC Verification</h2>
      
      {user?.kycStatus === 'PENDING' ? (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Verification in Progress</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your KYC verification is being processed. This usually takes 24-48 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit((data) => kycMutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="bvn" className="block text-sm font-medium text-gray-700">
                BVN
              </label>
              <input
                {...register('bvn')}
                type="text"
                maxLength={11}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.bvn && (
                <p className="mt-1 text-sm text-red-600">{errors.bvn.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="idType" className="block text-sm font-medium text-gray-700">
                ID Type
              </label>
              <select
                {...register('idType')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select ID Type</option>
                <option value="NIN">National ID (NIN)</option>
                <option value="PASSPORT">International Passport</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
              </select>
              {errors.idType && (
                <p className="mt-1 text-sm text-red-600">{errors.idType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                ID Number
              </label>
              <input
                {...register('idNumber')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.idNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.idNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Residential Address
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={kycMutation.isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {kycMutation.isLoading ? 'Submitting...' : 'Submit KYC'}
          </button>
        </form>
      )}
    </div>
  );
}