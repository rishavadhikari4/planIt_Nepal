import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import '../styles/Contact.css';

const AdminContact = () => {
  return (
    <div className="main-container">
      <div className="textes">
        <p>
          in this section the user  can directly contact to the clients
        </p>
      </div>
    <div className="contact-page container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Information</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="custom-card">
          <div className="custom-card-header">
            <h2 className="custom-card-title">
              <Mail className="icon" /> Email
            </h2>
          </div>
          <div className="custom-card-content">
            <p>LaganGaatho HQ</p>
            <p className="muted-text">owner@Lagangaatho.com</p>
          </div>
        </div>

        <div className="custom-card">
          <div className="custom-card-header">
            <h2 className="custom-card-title">
              <Phone className="icon" /> Phone
            </h2>
          </div>
          <div className="custom-card-content">
            <p>Customer Support</p>
            <p className="muted-text">(555) 987-6543</p>
          </div>
        </div>

        <div className="custom-card">
          <div className="custom-card-header">
            <h2 className="custom-card-title">
              <MapPin className="icon" /> Address
            </h2>
          </div>
          <div className="custom-card-content">
            <p>LaganGaatho Headquarters</p>
            <p className="muted-text">Satdobato,Lalitpur</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminContact;
