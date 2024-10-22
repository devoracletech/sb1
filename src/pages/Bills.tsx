import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const billSchema = z.object({
  billType: z.enum(['ELECTRICITY', 'WATER', 'INTERNET', 'TV', 'PHONE', 'EDUCATION', 'BETTING', 'INSURANCE']),
  provider: z.string(),
  accountNumber: z.string(),
  amount: z.number().min(100),
});

type BillFormData = z.infer<typeof billSchema>;

const providers = {
  ELECTRICITY: ['EKEDC', 'IKEDC', 'AEDC', 'PHEDC', 'BEDC', 'EEDC', 'KEDCO', 'JED'],
  WATER: ['Lagos Water', 'FCT Water Board', 'Kaduna Water', 'Rivers Water'],
  INTERNET: ['MTN', 'Airtel', 'Glo', '9mobile', 'Spectranet', 'Smile', 'Swift', 'ipNX'],
  TV: ['DSTV', 'GOtv', 'StarTimes', 'ShowMax', 'Netflix'],
  PHONE: ['MTN', 'Airtel', 'Glo', '9mobile'],
  EDUCATION: ['WAEC', 'JAMB', 'NECO', 'NABTEB'],
  BETTING: ['Bet9ja', 'SportyBet', 'NairaBet', '1xBet', 'BetKing'],
  INSURANCE: ['AIICO', 'Leadway', 'AXA Mansard', 'NEM Insurance']
};

export default function Bills() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
  });

  const selectedBillType = watch('billType');

  const billPaymentMutation = useMutation(
    async (data: BillFormData) => {
      const response = await axios.post('/api/bills/pay', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Bill payment successful!');
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Payment failed');
      },
    }
  );

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pay Bills</h2>
      <form onSubmit={handleSubmit((data) => billPaymentMutation.mutate(data))} className="space-y-6">
        <div>
          <label htmlFor="billType" className="block text-sm font-medium text-gray-700">
            Bill Type
          </label>
          <select
            {...register('billType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select bill type</option>
            {Object.keys(providers).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.billType && (
            <p className="mt-1 text-sm text-red-600">{errors.billType.message}</p>
          )}
        </div>

        {selectedBillType && (
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              Provider
            </label>
            <select
              {...register('provider')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select provider</option>
              {providers[selectedBillType as keyof typeof providers].map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
            {errors.provider && (
              <p className="mt-1 text-sm text-red-600">{errors.provider.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
            {selectedBillType === 'EDUCATION' ? 'Registration Number' : 
             selectedBillType === 'BETTING' ? 'User ID' : 
             'Account/Meter Number'}
          </label>
          <input
            {...register('accountNumber')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.accountNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (₦)
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            min="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={billPaymentMutation.isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {billPaymentMutation.isLoading ? 'Processing...' : 'Pay Bill'}
        </button>
      </form>
    </div>
  );
}