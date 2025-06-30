import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="grid grid-cols-3 gap-8 p-5">
  <div className="bg-white p-10 rounded-lg shadow-md border border-gray-200">
    <div className="flex items-center text-xl font-semibold mb-4 text-gray-800">
      <Mail className="w-6 h-6 text-blue-500 mr-2" /> Email
    </div>
    <div className="text-gray-700">
      <p className="mb-1">LaganGaatho HQ</p>
      <p className="text-sm text-gray-500">owner@Lagangaatho.com</p>
    </div>
  </div>

  <div className="bg-white p-10 rounded-lg shadow-md border border-gray-200">
    <div className="flex items-center text-xl font-semibold mb-4 text-gray-800">
      <Phone className="w-6 h-6 text-green-500 mr-2" /> Phone
    </div>
    <div className="text-gray-700">
      <p className="mb-1">Customer Support</p>
      <p className="text-sm text-gray-500">(555) 987-6543</p>
    </div>
  </div>

  <div className="bg-white p-10 rounded-lg shadow-md border border-gray-200">
    <div className="flex items-center text-xl font-semibold mb-4 text-gray-800">
      <MapPin className="w-6 h-6 text-red-500 mr-2" /> Address
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
