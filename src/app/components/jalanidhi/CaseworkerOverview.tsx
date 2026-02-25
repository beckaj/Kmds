import { useState } from 'react';
import { FileText, Clock, CheckCircle, Wrench } from 'lucide-react';
import SectionTitle from './SectionTitle';

interface CaseworkerOverviewProps {
  onNavigate: (path: string) => void;
}

export default function CaseworkerOverview({ onNavigate }: CaseworkerOverviewProps) {
  return (
    <div className="min-h-screen bg-[#f5f5fa] px-8 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <SectionTitle title="Caseworker Dashboard" className="mb-2" />
        <p className="text-gray-600 font-['Poppins',sans-serif]">
          Welcome to the Caseworker Panel - Review and process applications
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">
                Total Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                0
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                0
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">
                Approved
              </p>
              <p className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                0
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-['Poppins',sans-serif] mb-1">
                Plumber Licenses
              </p>
              <p className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                0
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Quick Actions
        </h2>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tap Connection Card */}
            <button
              onClick={() => onNavigate('/jalanidhi/caseworker/tap-connection/new-requests')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-400 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 font-['Poppins',sans-serif] mb-2">
                    New Connection Requests
                  </h3>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                    Review and process tap connection applications submitted by citizens
                  </p>
                </div>
              </div>
            </button>

            {/* Plumber License Card */}
            <button
              onClick={() => onNavigate('/jalanidhi/caseworker/plumber-license')}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg hover:border-purple-400 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 font-['Poppins',sans-serif] mb-2">
                    Plumber License Applications
                  </h3>
                  <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                    Review plumber license applications and renewals
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#f8fafc] rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#1f3a5f] font-['Poppins',sans-serif] mb-4">
          Recent Activity
        </h2>

        <div>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-['Poppins',sans-serif]">
              No recent activity yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}