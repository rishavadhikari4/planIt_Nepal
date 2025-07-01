import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 sm:p-6 md:p-8">
      {/* Email Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2" /> Email
        </div>
        <div className="text-gray-700">
          <p className="mb-1">LaganGaatho HQ</p>
          <p className="text-sm text-gray-500">owner@Lagangaatho.com</p>
        </div>
      </div>

      {/* Phone Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2" /> Phone
        </div>
        <div className="text-gray-700">
          <p className="mb-1">Customer Support</p>
          <p className="text-sm text-gray-500">(555) 987-6543</p>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2" /> Address
        </div>
        <div className="text-gray-700">
          <p className="mb-1">LaganGaatho Headquarters</p>
          <p className="text-sm text-gray-500">Satdobato, Lalitpur</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
