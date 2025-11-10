import { useState } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Heart,
  CheckCircle,
  Code,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ContactForm from "../../components/forms/ContactForm"

const Contact = () => {
  const [hoveredCard, setHoveredCard] = useState(null)

  const handleFormSubmitSuccess = (formData) => {
    console.log("Form submitted successfully:", formData)
  }

  const contactInfo = [
    {
      id: "email",
      icon: Mail,
      title: "Email Us",
      subtitle: "PlanIt Nepal",
      value: "contact@PlanIt Nepal.com",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      description: "Send us an email anytime",
    },
    {
      id: "phone",
      icon: Phone,
      title: "Call Us",
      subtitle: "Customer Support",
      value: "(977) 9972342345",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      description: "Available 24/7 for support",
    },
    {
      id: "address",
      icon: MapPin,
      title: "Visit Us",
      subtitle: "PlanIt Nepal HQ",
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
            Ready to plan your next event? We're here to help make your special occasion absolutely perfect. Contact us
            today and let's start creating unforgettable memories together.
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
            <ContactForm 
              onSubmitSuccess={handleFormSubmitSuccess}
            />

            {/* Map and Additional Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {/* Interactive Google Map */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-purple-600" />
                      Find Us Here
                    </h3>
                    <a
                      href="https://www.google.com/maps/place/Satdobato,+Lalitpur+44700/@27.6520429,85.3284681,15z/data=!3m1!4b1!4m6!3m5!1s0x39eb1763afe90a91:0x24e78f10fcea8163!8m2!3d27.6515356!4d85.327837!16s%2Fg%2F1tct73vm?entry=ttu&g_ep=EgoyMDI1MDgxMy4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors duration-200"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-gray-600 mt-2">Satdobato, Lalitpur 44700, Nepal</p>
                </div>
                <div className="h-80 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14134.063842242418!2d85.3284681!3d27.6520429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1763afe90a91%3A0x24e78f10fcea8163!2sSatdobato%2C%20Lalitpur%2044700!5e0!3m2!1sen!2snp!4v1692000000000!5m2!1sen!2snp"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-b-3xl"
                    title="PlanIt Nepal Location - Satdobato, Lalitpur"
                  ></iframe>

                  {/* Map overlay for mobile touch */}
                  <div className="absolute inset-0 bg-transparent pointer-events-none md:pointer-events-auto"></div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  Why Choose PlanIt Nepal?
                </h3>
                <div className="space-y-4">
                  {[
                    "5+ years of professional event planning experience",
                    "200+ successful events organized across all categories",
                    "24/7 customer support and assistance",
                    "Customized event packages for every budget",
                    "Professional team of event specialists",
                    "Transparent pricing with no hidden costs",
                    "Full-service planning from concept to execution",
                    "Extensive network of trusted vendors and suppliers",
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
              {/*<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <Code className="w-6 h-6 mr-2 text-purple-600" />
                  Meet the Developer
                </h3>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  
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

                  
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Rishav Adhikari</h4>
                    <p className="text-gray-600 mb-4">Full Stack Developer</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Passionate about creating innovative digital solutions that bring people together for life's most memorable moments.
                    </p>

                    
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

                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        2+
                      </div>
                      <div className="text-xs text-gray-500">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        10+
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
              </div>*/}

              {/* Quick Contact */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Phone className="w-6 h-6 mr-2" />
                  Need Immediate Help?
                </h3>
                <p className="mb-6 text-purple-100">
                  For urgent inquiries or last-minute event planning, call us directly. We're here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+4239876543"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    Call Now: (977) 9823456321
                  </a>
                  <a
                    href="mailto:contact@eventmanagerpro.com"
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
