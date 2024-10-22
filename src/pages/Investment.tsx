import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Investment, InvestmentPlan } from '../types';
import {
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const investmentSchema = z.object({
  planId: z.string(),
  amount: z.number().min(1000),
  duration: z.number(),
  autoReinvest: z.boolean().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export default function Investment() {
  const { user } = useAuth();
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
  });

  const { data: plans } = useQuery<InvestmentPlan[]>(
    ['investment-plans'],
    async () => {
      const response = await axios.get('/api/investments/plans');
      return response.data;
    }
  );

  const { data: investments, refetch: refetchInvestments } = useQuery<Investment[]>(
    ['investments'],
    async () => {
      const response = await axios.get('/api/investments');
      return response.data;
    }
  );

  const investMutation = useMutation(
    async (data: InvestmentFormData) => {
      const response = await axios.post('/api/investments', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Investment created successfully');
        setShowInvestmentForm(false);
        reset();
        refetchInvestments();
        
        // Download investment certificate
        window.open(data.certificateUrl, '_blank');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create investment');
      },
    }
  );

  const downloadCertificateMutation = useMutation(
    async (investmentId: string) => {
      const response = await axios.get(`/api/investments/${investmentId}/certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'investment-certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    {
      onError: (error: any) => {
        toast.error('Failed to download certificate');
      },
    }
  );

  const calculateReturns = (amount: number, rate: number, duration: number) => {
    return amount * (1 + (rate / 100) * duration);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Investment Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Invested</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₦{investments?.reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Active Investments</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {investments?.filter((inv) => inv.status === 'ACTIVE').length || 0}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Expected Returns</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₦{investments?.reduce((acc, inv) => acc + inv.totalReturn, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Next Payout</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {investments?.sort((a, b) => 
                new Date(a.nextPayoutDate).getTime() - new Date(b.nextPayoutDate).getTime()
              )[0]?.nextPayoutDate
                ? new Date(investments[0].nextPayoutDate).toLocaleDateString()
                : 'No active investments'}
            </p>
          </div>
        </div>
      </div>

      {/* Investment Plans */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Investment Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="border rounded-lg p-6 hover:border-indigo-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.riskLevel === 'LOW'
                    ? 'bg-green-100 text-green-800'
                    : plan.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {plan.riskLevel} Risk
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>₦{plan.minAmount.toLocaleString()} - ₦{plan.maxAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{plan.interestRate}% per annum</span>
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{plan.duration} months</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Features:</h4>
                <ul className="mt-2 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-500 flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowInvestmentForm(true);
                }}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Invest Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Investments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Investments</h2>
        <div className="space-y-6">
          {investments?.map((investment) => (
            <div key={investment.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {plans?.find((p) => p.id === investment.planId)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Invested: ₦{investment.amount.toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  investment.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : investment.status === 'MATURED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {investment.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {new Date(investment.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maturity Date</p>
                  <p className="font-medium">
                    {new Date(investment.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="font-medium">{investment.interestRate}% per annum</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Returns</p>
                  <p className="font-medium">₦{investment.totalReturn.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => downloadCertificateMutation.mutate(investment.id)}
                  className="flex items-center text-indigo-600 hover:text-indigo-700"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-1" />
                  Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Form Modal */}
      {showInvestmentForm && selectedPlan && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Invest in {selectedPlan.name}
            </h3>
            <form onSubmit={handleSubmit((data) => investMutation.mutate(data))} className="space-y-4">
              <input type="hidden" {...register('planId')} value={selectedPlan.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Investment Amount (₦)
                </label>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  min={selectedPlan.minAmount}
                  max={selectedPlan.maxAmount}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Investment Duration (Months)
                </label>
                <input
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  min={selectedPlan.duration}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('autoReinvest')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Automatically reinvest returns at maturity
                </label>
              </div>

              {watch('amount') && watch('duration') && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Expected Returns:
                    <span className="ml-2 font-medium">
                      ₦{calculateReturns(
                        watch('amount'),
                        selectedPlan.interestRate,
                        watch('duration')
                      ).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowInvestmentForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={investMutation.isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {investMutation.isLoading ? 'Processing...' : 'Confirm Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}