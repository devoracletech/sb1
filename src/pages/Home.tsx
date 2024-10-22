import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BanknotesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CreditCardIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Secure Transactions',
    description: 'Bank-grade security for all your financial transactions',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Instant Transfers',
    description: 'Send money instantly to any bank in Nigeria',
    icon: BanknotesIcon,
  },
  {
    name: 'Bill Payments',
    description: 'Pay utilities, TV, internet, and more with ease',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Smart Investments',
    description: 'Grow your wealth with our investment products',
    icon: ChartBarIcon,
  },
  {
    name: 'Virtual Cards',
    description: 'Create virtual cards for online transactions',
    icon: CreditCardIcon,
  },
  {
    name: 'Flight Booking',
    description: 'Book flights directly from your wallet',
    icon: GlobeAltIcon,
  },
];

const testimonials = [
  {
    content: "PayEase has transformed how I handle my finances. The investment features are amazing!",
    author: "Sarah Johnson",
    role: "Business Owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    content: "The virtual card feature is perfect for my online shopping needs. Highly recommended!",
    author: "Michael Chen",
    role: "Tech Professional",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
  {
    content: "Best platform for bill payments and transfers. The interface is so user-friendly!",
    author: "Aisha Mohammed",
    role: "Student",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Your Complete</span>
              <span className="block text-indigo-200">Financial Solution</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Experience seamless banking, investments, and payments all in one place. Join thousands of Nigerians who trust PayEase for their financial needs.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need in One App
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Experience a complete suite of financial tools designed for the modern Nigerian.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {feature.name}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted by Thousands of Nigerians
            </h2>
            <p className="mt-3 text-xl text-indigo-200 sm:mt-4">
              Join our growing community of satisfied users
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                Active Users
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">100K+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                Daily Transactions
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">₦50M+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
                Customer Rating
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">4.9/5</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
          </div>
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={testimonial.image}
                        alt={testimonial.author}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.author}
                        </div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-500">{testimonial.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-600">Join PayEase today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Download App
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Download Our Mobile App</h3>
            <div className="space-y-4">
              <a
                href="#"
                className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-900"
              >
                <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.543 14.1c-.651 0-1.178.527-1.178 1.178 0 .651.527 1.178 1.178 1.178.651 0 1.178-.527 1.178-1.178 0-.651-.527-1.178-1.178-1.178zm0 2.357c-.651 0-1.178.527-1.178 1.178 0 .651.527 1.178 1.178 1.178.651 0 1.178-.527 1.178-1.178 0-.651-.527-1.178-1.178-1.178zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.918 15.557c-.651 0-1.178.527-1.178 1.178s.527 1.178 1.178 1.178c.651 0 1.178-.527 1.178-1.178s-.527-1.178-1.178-1.178z"/>
                </svg>
                Download on App Store
              </a>
              <a
                href="#"
                className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v18H3V3zm15.5 7.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-7.5 1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"/>
                </svg>
                Get it on Google Play
              </a>
            </div>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}