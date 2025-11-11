import { Mail, Phone, Calendar, Camera, Utensils, Users, MapPin, Star, Wand2, Sparkles as SparklesIcon } from "lucide-react"
import Review from "./Review.jsx"
import { useNavigate } from "react-router-dom"
import ContactForm from "../../components/forms/ContactForm"
import RecommendationComponent from "../../components/RecommendationComponent"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useContext, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useContext(AuthContext)
  const [showRecommendations, setShowRecommendations] = useState(false)
  
  const featuresRef = useRef(null)
  const servicesRef = useRef(null)
  const contactRef = useRef(null)
  
  const featuresInView = useInView(featuresRef, { once: true, threshold: 0.1 })
  const servicesInView = useInView(servicesRef, { once: true, threshold: 0.1 })
  const contactInView = useInView(contactRef, { once: true, threshold: 0.1 })

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
    toast.info("Please login to start planning your event! 🚀");
    navigate('/login');
  };

  const handleGetRecommendations = () => {
    setShowRecommendations(true);
  };

  const handleContactFormSuccess = (formData) => {
    console.log("Home page contact form submitted:", formData);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const recommendationButtonVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.4)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-indigo-800/60 to-purple-900/70 z-10"></div>
        <motion.img
          src="https://d1zpvjny0s6omk.cloudfront.net/media/fileupload/2015/06/05/00_Pate_1741-2.jpeg"
          alt="Professional event management"
          className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center p-4"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to PlanIt Nepal
          </motion.h1>
          <motion.p 
            className="text-base sm:text-xl md:text-2xl max-w-4xl leading-relaxed text-white/90 px-4 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Your premier destination for exceptional event planning and management. From corporate conferences to wedding celebrations, 
            we bring your vision to life with stunning venues, delicious catering, and professional photography.
          </motion.p>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {isAuthenticated && isCustomer ? (
              <motion.button 
                onClick={handleGetRecommendations}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-2xl flex items-center space-x-3"
                variants={recommendationButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Wand2 className="w-6 h-6" />
                <span>Get Perfect Wedding Package</span>
                <SparklesIcon className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button 
                onClick={handleStartPlanning}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-2xl"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Start Planning Your Event
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div 
        ref={featuresRef}
        className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6"
        variants={containerVariants}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Comprehensive Event Services
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create memorable and successful events
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
        >
          <motion.div 
            onClick={() => handleVenueClick()} 
            className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100/50 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            {...cardHoverVariants}
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                variants={iconVariants}
                whileHover="hover"
              >
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Event Venues</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Discover premium venues for any occasion - from corporate meetings to grand celebrations, 
              we have the perfect space for your event.
            </p>
          </motion.div>

          <motion.div 
            onClick={() => handleDishesClick()}
            className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg p-6 sm:p-8 border border-emerald-100/50 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            {...cardHoverVariants}
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                variants={iconVariants}
                whileHover="hover"
              >
                <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Catering Services</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Exceptional culinary experiences crafted by professional chefs. From business lunches to 
              gala dinners, we cater to all tastes and dietary requirements.
            </p>
          </motion.div>

          <motion.div 
            onClick={() => handlestudioClick()}
            className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-6 sm:p-8 border border-purple-100/50 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            {...cardHoverVariants}
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                variants={iconVariants}
                whileHover="hover"
              >
                <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Photography & Media</h3>
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Capture every precious moment with our professional photography and videography services. 
              Perfect for corporate events, celebrations, and special occasions.
            </p>
          </motion.div>
        </motion.div>

        {/* Additional Services Grid */}
        <motion.div 
          ref={servicesRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          variants={containerVariants}
          initial="hidden"
          animate={servicesInView ? "visible" : "hidden"}
        >
          {[
            { icon: Users, title: "Corporate Events", desc: "Conferences, meetings, team building", color: "text-blue-500" },
            { icon: Calendar, title: "Social Events", desc: "Birthdays, anniversaries, parties", color: "text-emerald-500" },
            { icon: Star, title: "Weddings", desc: "Dream weddings made perfect", color: "text-purple-500" },
            { icon: MapPin, title: "Outdoor Events", desc: "Festivals, concerts, exhibitions", color: "text-indigo-500" }
          ].map((service, index) => (
            <motion.div
              key={service.title}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer"
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
              custom={index}
            >
              <motion.div
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <service.icon className={`w-8 h-8 ${service.color} mx-auto mb-3`} />
              </motion.div>
              <h4 className="font-semibold text-gray-800 mb-2">{service.title}</h4>
              <p className="text-sm text-gray-600">{service.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Reviews Section */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-16 sm:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Review />
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div 
        ref={contactRef}
        className="max-w-6xl mx-auto py-16 sm:py-20 px-4 sm:px-6"
        variants={containerVariants}
        initial="hidden"
        animate={contactInView ? "visible" : "hidden"}
      >
        <motion.div className="text-center mb-12 sm:mb-16" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Let's Plan Your Event
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to create an unforgettable experience? Our event planning experts are here to help bring your vision to life.
          </p>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-10 lg:gap-16"
          variants={containerVariants}
        >
          {/* Contact Info */}
          <motion.div className="space-y-6 sm:space-y-8" variants={itemVariants}>
            <motion.div 
              className="bg-gradient-to-br from-white to-blue-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100/50"
              whileHover={{
                y: -2,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h3>
              <div className="space-y-6">
                <motion.div 
                  className="flex items-center space-x-4 group cursor-pointer"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <Mail className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Email Us</p>
                    <p className="text-gray-600">contact@PlanItNepal.com</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-4 group cursor-pointer"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <Phone className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">Call Us</p>
                    <p className="text-gray-600">(555) 987-6543</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Why Choose Us */}
            <motion.div 
              className="bg-gradient-to-br from-white to-purple-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-purple-100/50"
              whileHover={{
                y: -2,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                {[
                  { color: "bg-blue-500", text: "200+ Successful Events Organized" },
                  { color: "bg-emerald-500", text: "Professional Team of Experts" },
                  { color: "bg-purple-500", text: "24/7 Customer Support" },
                  { color: "bg-pink-500", text: "Customized Event Packages" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <motion.div 
                      className={`w-2 h-2 ${item.color} rounded-full`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2 
                      }}
                    />
                    <p className="text-gray-700">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <ContactForm
              title="Quick Contact"
              description="Tell us about your event and we'll get back to you within 24 hours with a customized plan."
              compact={true}
              onSubmitSuccess={handleContactFormSuccess}
              className="shadow-2xl border-2 border-blue-100/50"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 py-12 text-center text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              PlanIt Nepal
            </h3>
            <p className="text-gray-300 text-lg">Creating exceptional experiences since 2020</p>
          </motion.div>
          <motion.div 
            className="border-t border-gray-700 pt-8 space-y-2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-300 text-sm sm:text-base">
              © {new Date().getFullYear()} PlanIt Nepal All rights reserved.
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              Designed with <motion.span
                className="text-blue-400 text-lg inline-block"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >💙</motion.span> by PlanIt Nepal Team
            </p>
          </motion.div>
        </div>
      </motion.footer>

      {/* Recommendation Modal */}
      <RecommendationComponent 
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
      />
    </div>
  )
}

export default Home