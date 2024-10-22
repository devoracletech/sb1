import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const crimeReportSchema = z.object({
  crimeType: z.enum(['ROBBERY', 'FRAUD', 'CYBERCRIME', 'SCAM', 'IMPERSONATION', 'OTHER']),
  description: z.string().min(20, 'Please provide more details about the incident'),
  inProgress: z.boolean(),
  emergencyContacts: z.array(z.string()).optional(),
});

type CrimeReportFormData = z.infer<typeof crimeReportSchema>;

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export default function LiveCrimeReport({ onSubmit }: { onSubmit: () => void }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CrimeReportFormData>({
    resolver: zodResolver(crimeReportSchema),
  });

  const isInProgress = watch('inProgress');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates using reverse geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      setLocation({
        latitude,
        longitude,
        address: response.data.display_name,
      });
    } catch (error) {
      toast.error('Failed to get your location. Please enable location services.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, e.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to start audio recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      // Convert audio chunks to a file
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'audio-evidence.webm', { type: 'audio/webm' });
      setEvidenceFiles((files) => [...files, audioFile]);
      setAudioChunks([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEvidenceFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadEvidenceMutation = useMutation(
    async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('evidence', file));
      const response = await axios.post('/api/support/upload-evidence', formData);
      return response.data.urls;
    }
  );

  const submitCrimeReport = useMutation(
    async (data: CrimeReportFormData) => {
      if (!location) {
        throw new Error('Location is required');
      }

      let evidenceUrls: string[] = [];
      if (evidenceFiles.length > 0) {
        evidenceUrls = await uploadEvidenceMutation.mutateAsync(evidenceFiles);
      }

      const reportData = {
        type: 'LIVE_CRIME',
        subject: `Live Crime Report: ${data.crimeType}`,
        description: data.description,
        priority: 'HIGH',
        crimeDetails: {
          ...data,
          location,
          evidenceUrls,
        },
      };

      const response = await axios.post('/api/support/tickets', reportData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Crime report submitted successfully');
        onSubmit();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit crime report');
      },
    }
  );

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              This is for reporting financial crimes in progress. For emergencies, please contact emergency services directly.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => submitCrimeReport.mutate(data))} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type of Crime
          </label>
          <select
            {...register('crimeType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type of crime</option>
            <option value="ROBBERY">Robbery</option>
            <option value="FRAUD">Fraud</option>
            <option value="CYBERCRIME">Cybercrime</option>
            <option value="SCAM">Scam</option>
            <option value="IMPERSONATION">Impersonation</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.crimeType && (
            <p className="mt-1 text-sm text-red-600">{errors.crimeType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Is this crime currently in progress?
          </label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('inProgress')}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Yes, this is happening right now</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Please provide as much detail as possible"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your Location
          </label>
          <div className="mt-2">
            {isLoadingLocation ? (
              <p className="text-sm text-gray-500">Getting your location...</p>
            ) : location ? (
              <div className="text-sm text-gray-700">
                <p>{location.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {location.latitude}, {location.longitude}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                Get my location
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Evidence
          </label>
          <div className="mt-2 space-y-4">
            <div>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Record Audio'}
              </button>
              {isRecording && (
                <span className="text-sm text-red-600 animate-pulse">
                  Recording...
                </span>
              )}
            </div>

            {evidenceFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isInProgress && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Since this crime is in progress, our team will prioritize your report and contact relevant authorities if necessary.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitCrimeReport.isLoading || !location}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {submitCrimeReport.isLoading ? 'Submitting Report...' : 'Submit Crime Report'}
        </button>
      </form>
    </div>
  );
}