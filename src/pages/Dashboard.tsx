import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Transaction } from '../types';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: transactions } = useQuery<Transaction[]>(['transactions'], async () => {
    const response = await axios.get('/api/transactions');
    return response.data;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome, {user?.firstName}!</h2>
        <div className="mt-4">
          <p className="text-gray-500">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900">₦{user?.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        <div className="mt-4">
          {transactions?.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="border-t border-gray-200 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.type === 'TRANSFER' ? 'Money Transfer' : 'Bill Payment'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-sm ${transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-red-600'}`}>
                  ₦{transaction.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}