import { Mail, Phone, Calendar, Camera, Utensils, Users, MapPin, Star } from "lucide-react"
import Review from "./Review.jsx"
import { useNavigate } from "react-router-dom"
import ContactForm from "../../components/forms/ContactForm"

const Home = () => {
  const navigate = useNavigate()

  const handleVenueClick = () => {
    navigate('/venues');
  };
  const handleDishesClick = () => {
    navigate('/cuisines');
  };
  const handlestudioClick = () => {
    navigate('/studios');
  };

  const handleStartPlanning = () => {
    navigate('/venues');
  };

  const handleContactFormSuccess = (formData) => {
    console.log("Home page contact form submitted:", formData);
    // You can add any additional logic here if needed
  };

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-indigo-800/60 to-purple-900/70 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop"
          alt="Professional event management"
          className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center p-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Welcome to PlanIt Nepal
          </h1>
          <p className="text-base sm:text-xl md:text-2xl max-w-4xl leading-relaxed text-white/90 px-4 mb-8">
            Your premier destination for exceptional event planning and management. From corporate conferences to birthday celebrations, 
            we bring your vision to life with stunning venues, delicious catering, and professional photography.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={handleStartPlanning}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Planning Your Event
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Comprehensive Event Services
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create memorable and successful events
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
          <div onClick={()=> handleVenueClick() } className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 border border-blue-100/50 cursor-pointer">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Event Venues</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Discover premium venues for any occasion - from corporate meetings to grand celebrations, 
              we have the perfect space for your event.
            </p>
          </div>

          <div onClick={()=> handleDishesClick() }  className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 border border-emerald-100/50 cursor-pointer">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Catering Services</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Exceptional culinary experiences crafted by professional chefs. From business lunches to 
              gala dinners, we cater to all tastes and dietary requirements.
            </p>
          </div>

          {/* Photography/Studios Card */}
          <div onClick={()=> handlestudioClick() }  className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 border border-purple-100/50 cursor-pointer">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Photography & Media</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Capture every precious moment with our professional photography and videography services. 
              Perfect for corporate events, celebrations, and special occasions.
            </p>
          </div>
        </div>

        {/* Additional Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Corporate Events</h4>
            <p className="text-sm text-gray-600">Conferences, meetings, team building</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <Calendar className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Social Events</h4>
            <p className="text-sm text-gray-600">Birthdays, anniversaries, parties</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Weddings</h4>
            <p className="text-sm text-gray-600">Dream weddings made perfect</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <MapPin className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Outdoor Events</h4>
            <p className="text-sm text-gray-600">Festivals, concerts, exhibitions</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Review />
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Let's Plan Your Event
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to create an unforgettable experience? Our event planning experts are here to help bring your vision to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Email Us</p>
                    <p className="text-gray-600">contact@PlanIt Nepal.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Call Us</p>
                    <p className="text-gray-600">(555) 987-6543</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us - Quick Points */}
            <div className="bg-gradient-to-br from-white to-purple-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-purple-100/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-gray-700">200+ Successful Events Organized</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <p className="text-gray-700">Professional Team of Experts</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-gray-700">24/7 Customer Support</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <p className="text-gray-700">Customized Event Packages</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form using the new ContactForm component */}
          <ContactForm
            title="Quick Contact"
            description="Tell us about your event and we'll get back to you within 24 hours with a customized plan."
            compact={true}
            onSubmitSuccess={handleContactFormSuccess}
            className="shadow-2xl border-2 border-blue-100/50"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 py-12 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              PlanIt Nepal
            </h3>
            <p className="text-gray-300 text-lg">Creating exceptional experiences since 2020</p>
          </div>
          <div className="border-t border-gray-700 pt-8 space-y-2">
            <p className="text-gray-300 text-sm sm:text-base">
              © {new Date().getFullYear()} PlanIt Nepal All rights reserved.
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              Designed with <span className="text-blue-400 text-lg">💙</span> by PlanIt Nepal Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
