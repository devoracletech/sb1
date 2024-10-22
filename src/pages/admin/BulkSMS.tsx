import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const smsSchema = z.object({
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  message: z.string().min(1, 'Message is required').max(160, 'Message too long'),
  schedule: z.string().optional(),
  template: z.string().optional(),
});

type SMSFormData = z.infer<typeof smsSchema>;

interface Template {
  id: string;
  name: string;
  content: string;
}

interface SMSReport {
  id: string;
  sentAt: Date;
  recipients: number;
  delivered: number;
  failed: number;
  message: string;
}

export default function BulkSMS() {
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [previewRecipients, setPreviewRecipients] = useState<string[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SMSFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      recipients: [],
    },
  });

  const { data: templates } = useQuery<Template[]>(['sms-templates'], async () => {
    const response = await axios.get('/api/admin/sms/templates');
    return response.data;
  });

  const { data: reports } = useQuery<SMSReport[]>(['sms-reports'], async () => {
    const response = await axios.get('/api/admin/sms/reports');
    return response.data;
  });

  const sendSMSMutation = useMutation(
    async (data: SMSFormData) => {
      const response = await axios.post('/api/admin/sms/send', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('SMS campaign started successfully');
        reset();
        setRecipientFile(null);
        setPreviewRecipients([]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to send SMS');
      },
    }
  );

  const createTemplateMutation = useMutation(
    async (template: { name: string; content: string }) => {
      const response = await axios.post('/api/admin/sms/templates', template);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Template created successfully');
        setShowTemplateModal(false);
        setNewTemplate({ name: '', content: '' });
      },
    }
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRecipientFile(file);
      Papa.parse(file, {
        complete: (results) => {
          const phoneNumbers = results.data
            .flat()
            .filter((num): num is string => typeof num === 'string' && num.length > 0);
          setPreviewRecipients(phoneNumbers.slice(0, 5));
          setValue('recipients', phoneNumbers);
        },
      });
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setValue('message', template.content);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SMS Dashboard */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Messages</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {reports?.reduce((acc, report) => acc + report.recipients, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Delivered</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {reports?.reduce((acc, report) => acc + report.delivered, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Failed</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {reports?.reduce((acc, report) => acc + report.failed, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Templates</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {templates?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* SMS Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Send Bulk SMS</h2>
        <form onSubmit={handleSubmit((data) => sendSMSMutation.mutate(data))} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Recipients</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/templates/recipients_template.csv';
                  link.download = 'recipients_template.csv';
                  link.click();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                Download Template
              </button>
            </div>
            {previewRecipients.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Preview ({previewRecipients.length} of {watch('recipients').length}):</p>
                <div className="mt-1 text-sm text-gray-700">
                  {previewRecipients.map((num, i) => (
                    <span key={i} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-2">
                      {num}
                    </span>
                  ))}
                  {watch('recipients').length > previewRecipients.length && '...'}
                </div>
              </div>
            )}
            {errors.recipients && (
              <p className="mt-1 text-sm text-red-600">{errors.recipients.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Create Template
              </button>
            </div>
            {templates && templates.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
            <textarea
              {...register('message')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your message here..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Characters: {watch('message')?.length || 0}/160
            </p>
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule (Optional)</label>
            <input
              type="datetime-local"
              {...register('schedule')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={sendSMSMutation.isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {sendSMSMutation.isLoading ? (
              'Sending...'
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Send SMS
              </>
            )}
          </button>
        </form>
      </div>

      {/* SMS Reports */}
      {reports && reports.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">SMS Reports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.recipients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {report.delivered}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {report.failed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{report.message}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create SMS Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Template Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Characters: {newTemplate.content.length}/160
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createTemplateMutation.mutate(newTemplate)}
                  disabled={!newTemplate.name || !newTemplate.content}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}