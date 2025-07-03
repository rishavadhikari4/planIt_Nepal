"use client"

import { Mail, Phone, MapPin, MessageCircle, Clock, Globe } from "lucide-react"
import { motion } from "framer-motion"

const AdminContact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      subtitle: "weddingPlanner HQ",
      value: "owner@weddingPlanner.com",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Phone",
      subtitle: "Customer Support",
      value: "(555) 987-6543",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Available 24/7 for support",
    },
    {
      icon: MapPin,
      title: "Address",
      subtitle: "weddingPlanner Headquarters",
      value: "Satdobato, Lalitpur",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "Visit us at our office",
    },
  ]

  const additionalInfo = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      value: "Available on website",
      color: "text-purple-500",
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon-Fri: 9AM-6PM",
      color: "text-orange-500",
    },
    {
      icon: Globe,
      title: "Website",
      value: "www.weddingPlanner.com",
      color: "text-indigo-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Contact Information
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team. We're here to help you create the perfect wedding experience.
          </p>
        </motion.div>

        {/* Main Contact Cards */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon
              return (
                <motion.div
                  key={contact.title}
                  className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="p-8">
                    {/* Icon and Title */}
                    <div className="flex items-center mb-6">
                      <div
                        className={`w-12 h-12 ${contact.bgColor} ${contact.borderColor} border-2 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className={`w-6 h-6 ${contact.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {contact.title}
                        </h3>
                        <p className="text-sm text-gray-500">{contact.description}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-800">{contact.subtitle}</p>
                      <p
                        className={`text-base font-medium ${contact.color} group-hover:underline cursor-pointer transition-all duration-200`}
                      >
                        {contact.value}
                      </p>
                    </div>

                    {/* Hover Effect Background */}
                    <div
                      className={`absolute inset-0 ${contact.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    ></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Additional Information */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {additionalInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <motion.div
                    key={info.title}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{info.title}</p>
                      <p className="text-gray-600 text-sm">{info.value}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Plan Your Dream Wedding?</h3>
            <p className="text-blue-100 mb-6">Contact us today and let's make your special day unforgettable.</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl">
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminContact
