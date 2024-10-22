import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Feature, FeatureUpdate } from '../../types';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  GlobeAltIcon,
  CubeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const categoryIcons = {
  CORE: CubeIcon,
  PAYMENT: CurrencyDollarIcon,
  SECURITY: ShieldCheckIcon,
  INVESTMENT: CreditCardIcon,
  CRYPTO: CurrencyDollarIcon,
  TRAVEL: GlobeAltIcon,
};

export default function FeatureManagement() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [updateReason, setUpdateReason] = useState('');

  const { data: features, refetch: refetchFeatures } = useQuery<Feature[]>(
    ['admin-features'],
    async () => {
      const response = await axios.get('/api/admin/features');
      return response.data;
    }
  );

  const updateFeatureMutation = useMutation(
    async ({ featureId, update }: { featureId: string; update: FeatureUpdate }) => {
      const response = await axios.patch(`/api/admin/features/${featureId}`, update);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Feature status updated successfully');
        setSelectedFeature(null);
        setUpdateReason('');
        refetchFeatures();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update feature');
      },
    }
  );

  const handleUpdateFeature = (feature: Feature) => {
    setSelectedFeature(feature);
  };

  const confirmUpdate = () => {
    if (!selectedFeature) return;

    updateFeatureMutation.mutate({
      featureId: selectedFeature.id,
      update: {
        enabled: !selectedFeature.enabled,
        reason: updateReason,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Feature Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Control and manage platform features and functionalities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features?.map((feature) => {
          const Icon = categoryIcons[feature.category];
          return (
            <div
              key={feature.id}
              className="relative rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${
                  feature.enabled ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {feature.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleUpdateFeature(feature)}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      feature.enabled ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                        feature.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {feature.category}
                </span>
                <span className="text-gray-500">
                  Updated: {new Date(feature.lastUpdatedAt).toLocaleDateString()}
                </span>
              </div>
              {feature.requiresKyc && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Requires KYC
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Update Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update Feature Status
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Feature</p>
                <p className="mt-1">{selectedFeature.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Current Status</p>
                <p className="mt-1">
                  {selectedFeature.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Update
                </label>
                <textarea
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter reason for the status update..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedFeature(null);
                    setUpdateReason('');
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdate}
                  disabled={!updateReason.trim()}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}