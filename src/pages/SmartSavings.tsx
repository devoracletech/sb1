import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { SavingsGoal, SavingsSuggestion, SpendingPattern } from '../types';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  LightBulbIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const goalSchema = z.object({
  name: z.string().min(3, 'Goal name is required'),
  targetAmount: z.number().min(1000, 'Minimum target amount is ₦1,000'),
  deadline: z.string(),
  category: z.enum(['EMERGENCY', 'HOUSE', 'CAR', 'EDUCATION', 'VACATION', 'WEDDING', 'CUSTOM']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  autoSave: z.boolean(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export default function SmartSavings() {
  const { user } = useAuth();
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const { data: goals, refetch: refetchGoals } = useQuery<SavingsGoal[]>(
    ['savings-goals'],
    async () => {
      const response = await axios.get('/api/savings/goals');
      return response.data;
    }
  );

  const { data: suggestions } = useQuery<SavingsSuggestion[]>(
    ['savings-suggestions'],
    async () => {
      const response = await axios.get('/api/savings/suggestions');
      return response.data;
    }
  );

  const { data: spendingPatterns } = useQuery<SpendingPattern[]>(
    ['spending-patterns'],
    async () => {
      const response = await axios.get('/api/savings/spending-patterns');
      return response.data;
    }
  );

  const createGoalMutation = useMutation(
    async (data: GoalFormData) => {
      const response = await axios.post('/api/savings/goals', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Savings goal created successfully');
        setShowNewGoalForm(false);
        reset();
        refetchGoals();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create savings goal');
      },
    }
  );

  const updateGoalMutation = useMutation(
    async ({ goalId, status }: { goalId: string; status: 'ACTIVE' | 'PAUSED' }) => {
      const response = await axios.patch(`/api/savings/goals/${goalId}`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Goal status updated successfully');
        refetchGoals();
      },
    }
  );

  const applySuggestionMutation = useMutation(
    async (suggestion: SavingsSuggestion) => {
      const response = await axios.post('/api/savings/apply-suggestion', { suggestionId: suggestion.id });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Savings suggestion applied successfully');
        refetchGoals();
      },
    }
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const calculateSavingsProgress = (goal: SavingsGoal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Savings</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₦{goals?.reduce((acc, goal) => acc + goal.currentAmount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Active Goals</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {goals?.filter((goal) => goal.status === 'ACTIVE').length || 0}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Monthly Savings Rate</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₦{(goals?.reduce((acc, goal) => {
                if (goal.status !== 'ACTIVE') return acc;
                const monthlyAmount = goal.frequency === 'MONTHLY'
                  ? goal.targetAmount / (new Date(goal.deadline).getMonth() - new Date().getMonth() + 12)
                  : goal.frequency === 'WEEKLY'
                    ? (goal.targetAmount / 4)
                    : goal.targetAmount * 30;
                return acc + monthlyAmount;
              }, 0) || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Smart Savings Suggestions</h2>
            <LightBulbIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{suggestion.description}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Suggested Amount: ₦{suggestion.suggestedAmount.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600">
                        Potential Savings: ₦{suggestion.potentialSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => applySuggestionMutation.mutate(suggestion)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Patterns */}
      {spendingPatterns && spendingPatterns.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Spending Patterns</h2>
            <ChartBarIcon className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spendingPatterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{pattern.category}</h3>
                  {pattern.trend === 'INCREASING' ? (
                    <TrendingUpIcon className="h-5 w-5 text-red-500" />
                  ) : pattern.trend === 'DECREASING' ? (
                    <TrendingDownIcon className="h-5 w-5 text-green-500" />
                  ) : null}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₦{pattern.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">{pattern.frequency}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Goals */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Your Savings Goals</h2>
          <button
            onClick={() => setShowNewGoalForm(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Goal
          </button>
        </div>

        <div className="space-y-6">
          {goals?.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500">
                    Target: ₦{goal.targetAmount.toLocaleString()} by{' '}
                    {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateGoalMutation.mutate({
                      goalId: goal.id,
                      status: goal.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    goal.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {goal.status}
                </button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    ₦{goal.currentAmount.toLocaleString()} of ₦
                    {goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getProgressColor(
                      calculateSavingsProgress(goal)
                    )} rounded-full h-2 transition-all duration-500`}
                    style={{
                      width: `${Math.min(
                        100,
                        calculateSavingsProgress(goal)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {goal.frequency} auto-save:{' '}
                  <span className="font-medium">
                    ₦
                    {(
                      goal.targetAmount /
                      (goal.frequency === 'DAILY'
                        ? 30
                        : goal.frequency === 'WEEKLY'
                        ? 4
                        : 1)
                    ).toLocaleString()}
                  </span>
                </span>
                <span
                  className={`${
                    goal.autoSave ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {goal.autoSave ? 'Auto-save enabled' : 'Auto-save disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Goal Form Modal */}
      {showNewGoalForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Savings Goal</h3>
            <form onSubmit={handleSubmit((data) => createGoalMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="EMERGENCY">Emergency Fund</option>
                  <option value="HOUSE">House</option>
                  <option value="CAR">Car</option>
                  <option value="EDUCATION">Education</option>
                  <option value="VACATION">Vacation</option>
                  <option value="WEDDING">Wedding</option>
                  <option value="CUSTOM">Custom</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                <input
                  type="number"
                  {...register('targetAmount', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target Date</label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Saving Frequency</label>
                <select
                  {...register('frequency')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
                {errors.frequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('autoSave')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable automatic savings
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewGoalForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGoalMutation.isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {createGoalMutation.isLoading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}