import { Mail, Phone, Home as HomeIcon, Flower, Utensils } from 'lucide-react';
import { submitContactForm } from '../services/contactService.js';
import Review from './review.jsx';
import { toast } from 'react-toastify';

const Home = () => {
  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      budget: e.target.budget.value,
      message: e.target.message.value,
    };

    const result = await submitContactForm(formData);

    if (result.message === 'Contact Created Successfully') {
      toast.success('Your message has been sent successfully!');
      e.target.reset();
    } else {
      toast.error('There was an error sending your message. Please try again later.');
    }
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
        <div className="relative">
          <img
            src="https://thumbs.dreamstime.com/b/wedding-knot-illustration-hindu-tied-man-woman-dress-30426874.jpg?w=768"
            alt="Wedding celebration"
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)]">
              Welcome to Wedding Planner
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)]">
              Let us help you create the wedding of your dreams. From stunning venues to delicious dishes
              and beautiful decorations, we've got everything you need to make your special day perfect.
            </p>
          </div>
        </div>


      {/* Features Section */}
      <div className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4 text-xl font-semibold text-gray-800">
            <HomeIcon className="w-6 h-6 text-blue-500 mr-2" />
            Venues
          </div>
          <p className="text-gray-600">Discover beautiful locations for your special day</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4 text-xl font-semibold text-gray-800">
            <Utensils className="w-6 h-6 text-green-500 mr-2" />
            Catering
          </div>
          <p className="text-gray-600">Explore our diverse menu options</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4 text-xl font-semibold text-gray-800">
            <Flower className="w-6 h-6 text-pink-500 mr-2" />
            Decorations
          </div>
          <p className="text-gray-600">Choose from stunning decoration themes</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">What Our Clients Say</h2>
          <Review />
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Get in Touch</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <p className="flex items-center space-x-2 text-lg">
              <Mail className="w-5 h-5 text-blue-500" />
              <span>Email: Weddingplanner@support.com</span>
            </p>
            <p className="flex items-center space-x-2 text-lg">
              <Phone className="w-5 h-5 text-green-500" />
              <span>Phone: (555) 123-4567</span>
            </p>
          </div>

          {/* Contact Form */}
          <form onSubmit={onSubmit} className="space-y-4 bg-white shadow-md p-6 rounded-lg">
            <div>
              <label htmlFor="name" className="block font-medium mb-1">Name</label>
              <input type="text" name="name" id="name" required placeholder="Your name" className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-1">Email</label>
              <input type="email" name="email" id="email" required placeholder="Your email" className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div>
              <label htmlFor="phone" className="block font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                placeholder="Your phone number"
                pattern="[0-9]{10}"
                maxLength={10}
                minLength={10}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="budget" className="block font-medium mb-1">Budget</label>
              <input
                type="number"
                name="budget"
                id="budget"
                required
                placeholder="Your budget"
                min={1000000}
                max={10000000}
                step={10000}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <small className="text-gray-500">Range: 10,00,000 to 10,000,000</small>
            </div>
            <div>
              <label htmlFor="message" className="block font-medium mb-1">Message</label>
              <textarea
                name="message"
                id="message"
                required
                placeholder="Tell us about your wedding plans..."
                rows={4}
                className="w-full border border-gray-300 p-2 rounded"
              ></textarea>
            </div>
            <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition">Send Message</button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-600 text-lg">
        <p>© {new Date().getFullYear()} Wedding Planner. All rights reserved.</p>
        <p>Designed with <span className="text-red-500">❤️</span> by Wedding Planner Team</p>
      </footer>
    </div>
  );
};

export default Home;
