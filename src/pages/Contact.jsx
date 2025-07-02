import { useState } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Heart,
  Sparkles,
  CheckCircle,
  Code,
  Github,
  Linkedin,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast.success("Message sent successfully! We'll get back to you soon. 💌")
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    })
    setIsSubmitting(false)
  }

  const contactInfo = [
    {
      id: "email",
      icon: Mail,
      title: "Email Us",
      subtitle: "Wedding Planner HQ",
      value: "owner@WeddingPlanner.com",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      description: "Send us an email anytime",
    },
    {
      id: "phone",
      icon: Phone,
      title: "Call Us",
      subtitle: "Customer Support",
      value: "(555) 987-6543",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      description: "Available 24/7 for support",
    },
    {
      id: "address",
      icon: MapPin,
      title: "Visit Us",
      subtitle: "WeddingPlanner Headquarters",
      value: "Satdobato, Lalitpur",
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      description: "Come visit our office",
    },
    {
      id: "hours",
      icon: Clock,
      title: "Business Hours",
      subtitle: "We're Open",
      value: "Mon - Sat: 9AM - 7PM",
      color: "from-purple-500 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50",
      description: "Sunday by appointment",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-pink-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Get In Touch
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to plan your dream wedding? We're here to help make your special day absolutely perfect. Contact us
            today and let's start creating magical memories together.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Contact Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon
              return (
                <motion.div
                  key={info.id}
                  className={`group relative bg-gradient-to-br ${info.bgColor} backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 cursor-pointer`}
                  onMouseEnter={() => setHoveredCard(info.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative p-6 sm:p-8">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                        {info.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-600">{info.subtitle}</p>
                      <p className="text-base font-semibold text-gray-800">{info.value}</p>
                      <p className="text-xs text-gray-500 mt-2">{info.description}</p>
                    </div>

                    {/* Hover Effect */}
                    <AnimatePresence>
                      {hoveredCard === info.id && (
                        <motion.div
                          className="absolute bottom-4 right-4"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center shadow-lg`}
                          >
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Contact Form and Map Section */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours to discuss your wedding plans.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <option value="">Select a subject</option>
                      <option value="wedding-planning">Wedding Planning</option>
                      <option value="venue-inquiry">Venue Inquiry</option>
                      <option value="catering">Catering Services</option>
                      <option value="decorations">Decorations</option>
                      <option value="pricing">Pricing Information</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                    placeholder="Tell us about your dream wedding, preferred dates, guest count, and any special requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map and Additional Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {/* Map */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-purple-600" />
                    Find Us Here
                  </h3>
                </div>
                <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-500">Satdobato, Lalitpur</p>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  Why Choose LaganGaatho?
                </h3>
                <div className="space-y-4">
                  {[
                    "10+ years of wedding planning experience",
                    "500+ successful weddings organized",
                    "24/7 customer support and assistance",
                    "Personalized wedding packages",
                    "Professional team of experts",
                    "Competitive pricing with no hidden costs",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Developer Section */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <Code className="w-6 h-6 mr-2 text-purple-600" />
                  Meet the Developer
                </h3>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Developer Image */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <img
                        src="https://res.cloudinary.com/de1lvlqme/image/upload/v1751342264/ksfbq9t1if2ohvuxmazz.jpg"
                        alt="Developer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Developer Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Rishav Adhikari</h4>
                    <p className="text-gray-600 mb-4">Full Stack Developer & Wedding Tech Enthusiast</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Passionate about creating beautiful digital experiences for life's most special moments.
                    </p>

                    {/* Social Links */}
                    <div className="flex justify-center sm:justify-start space-x-4">
                      <a
                        href="https://github.com/rishavadhikari4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-gray-900 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                        title="GitHub Profile"
                      >
                        <Github className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/rishav-adhikari-6a52502a2/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-5 h-5 text-white" />
                      </a>
                      <a
                        href="mailto:rishavadhikari657@gmail.com"
                        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                        title="Email Developer"
                      >
                        <Mail className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Developer Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        1+
                      </div>
                      <div className="text-xs text-gray-500">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        5+
                      </div>
                      <div className="text-xs text-gray-500">Projects Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        100%
                      </div>
                      <div className="text-xs text-gray-500">Client Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Phone className="w-6 h-6 mr-2" />
                  Need Immediate Help?
                </h3>
                <p className="mb-6 text-purple-100">
                  For urgent inquiries or last-minute changes, call us directly. We're here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+5559876543"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    Call Now: (555) 987-6543
                  </a>
                  <a
                    href="mailto:owner@Lagangaatho.com"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
