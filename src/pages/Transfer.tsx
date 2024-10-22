import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const transferSchema = z.object({
  recipientEmail: z.string().email(),
  amount: z.number().min(100),
  description: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function Transfer() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const transferMutation = useMutation(
    async (data: TransferFormData) => {
      const response = await axios.post('/api/transfer', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Transfer successful!');
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Transfer failed');
      },
    }
  );

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transfer Money</h2>
      <form onSubmit={handleSubmit((data) => transferMutation.mutate(data))} className="space-y-6">
        <div>
          <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700">
            Recipient Email
          </label>
          <input
            {...register('recipientEmail')}
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.recipientEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.recipientEmail.message}</p>
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

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={transferMutation.isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {transferMutation.isLoading ? 'Processing...' : 'Send Money'}
        </button>
      </form>
    </div>
  );
}