import { Mail, Phone, HomeIcon, Flower, Utensils } from "lucide-react"
import { submitContactForm } from "../services/contactService.js"
import Review from "./review.jsx"
import { toast } from "react-toastify"
import { Navigate, useNavigate } from "react-router-dom"

const Home = () => {
  const navigate = useNavigate()
  const onSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      price: e.target.price.value,
      message: e.target.message.value,
    }

    const result = await submitContactForm(formData)
    if (result.message === "Contact Created Successfully") {
      toast.success("Your message has been sent successfully!")
      e.target.reset()
    } else {
      toast.error("There was an error sending your message. Please try again later.")
    }
  }

  const handleVenueClick = () => {
    navigate('/venues');
  };
  const handleDishesClick = () => {
    navigate('/dishes');
  };
  const handleDecorationClick = () => {
    navigate('/decorations');
  };

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-br from-slate-50 via-white to-purple-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-rose-800/60 to-pink-900/70 z-10"></div>
        <img
          src="https://thumbs.dreamstime.com/b/wedding-knot-illustration-hindu-tied-man-woman-dress-30426874.jpg?w=768"
          alt="Wedding celebration"
          className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center p-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-pink-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Welcome to Wedding Planner
          </h1>
          <p className="text-base sm:text-xl md:text-2xl max-w-4xl leading-relaxed text-white/90 px-4 mb-8">
            Let us help you create the wedding of your dreams. From stunning venues to delicious dishes and beautiful
            decorations, we've got everything you need to make your special day perfect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300">
              Start Planning
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-3 rounded-full font-semibold text-lg bg-transparent backdrop-blur-sm transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Our Premium Services
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for your perfect wedding day
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
          <div onClick={()=> handleVenueClick() } className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 border border-blue-100/50">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <HomeIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Venues</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Discover beautiful locations for your special day with breathtaking views and elegant settings
            </p>
          </div>

          <div onClick={()=> handleDishesClick() }  className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 border border-emerald-100/50">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Catering</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Explore our diverse menu options crafted by world-class chefs for an unforgettable dining experience
            </p>
          </div>

          <div onClick={()=> handleDecorationClick() }  className="group bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 border border-pink-100/50">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Flower className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Decorations</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Choose from stunning decoration themes that transform your venue into a magical wonderland
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Review />
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to start planning your dream wedding? Let's make it happen together
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Let's Connect</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Email Us</p>
                    <p className="text-gray-600">Weddingplanner@support.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Call Us</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={onSubmit}
            className="space-y-6 bg-white shadow-2xl p-6 sm:p-8 rounded-2xl border border-gray-100"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="Your full name"
                  className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  placeholder="(555) 123-4567"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="price" className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                  price Range
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  placeholder="1000000"
                  min={1000000}
                  max={10000000}
                  step={10000}
                  className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all duration-300 bg-gray-50 focus:bg-white"
                />
                <small className="text-gray-500 block mt-2 text-xs sm:text-sm">Range: ₹10,00,000 to ₹1,00,00,000</small>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                Tell Us About Your Dream Wedding
              </label>
              <textarea
                name="message"
                id="message"
                required
                placeholder="Share your vision, preferred dates, guest count, and any special requirements..."
                rows={5}
                className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 p-3 sm:p-4 rounded-xl text-sm sm:text-base transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300"
            >
              Send Message & Start Planning
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 py-12 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              Wedding Planner
            </h3>
            <p className="text-gray-300 text-lg">Creating magical moments since 2014</p>
          </div>
          <div className="border-t border-gray-700 pt-8 space-y-2">
            <p className="text-gray-300 text-sm sm:text-base">
              © {new Date().getFullYear()} Wedding Planner. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              Designed with <span className="text-red-400 text-lg">❤️</span> by Wedding Planner Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
