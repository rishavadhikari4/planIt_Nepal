import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Calendar, MapPin, Star, Users, Camera, Clock, Mail, Phone, Shield, Award, CheckCircle, Heart, ShoppingCart, Eye, XCircle } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../../context/CartContext"
import { getStudioById } from "../../services/studios"
import DateRangePicker from '../../components/ui/DateRangePicker';

const StudioDetails = () => {
  const { studioId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [studio, setStudio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookedDates, setBookedDates] = useState([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBookingCalendar, setShowBookingCalendar] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedBookingDates, setSelectedBookingDates] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchStudioDetails = async () => {
      if (!studioId) {
        setError("Studio ID not provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await getStudioById(studioId)

        if (response && response.success && response.data) {

          setStudio(response.data)
          setBookedDates(response.data.bookedDates || [])
          setTotalBookings(response.data.totalBookings || 0)
        } else if (response.data && response.data.studio) {

          setStudio(response.data.studio)
          setBookedDates(response.data.bookedDates || [])
          setTotalBookings(response.data.totalBookings || 0)
        } else if (response.studio) {

          setStudio(response.studio)
          setBookedDates(response.bookedDates || [])
          setTotalBookings(response.totalBookings || 0)
        } else if (response && response._id) {
          setStudio(response)
          setBookedDates(response.bookedDates || [])
          setTotalBookings(response.totalBookings || 0)
        } else {
          setError("Studio not found")
        }
      } catch (err) {
        console.error("Error fetching studio details:", err)
        setError("Failed to load studio details")
        toast.error("Failed to load studio details")
      } finally {
        setLoading(false)
      }
    }

    fetchStudioDetails()
  }, [studioId])

  const handleAddToCart = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.info("Please login to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!selectedBookingDates) {
      toast.error("Please select booking dates first!");
      return;
    }

    const studioItem = {
      _id: studio._id,
      name: studio.name,
      price: studio.price,
      image: studio.studioImage,
      quantity: 1,
      type: "studio"
    };

    addToCart(studioItem, selectedBookingDates);
  };

  const handleDateSelection = (dates) => {
    setSelectedBookingDates(dates);
    toast.success('Booking dates selected!');
  };

  const mainImage = studio?.studioImage || studio?.mainImage || "/placeholder.svg";

  const gallery = Array.isArray(studio?.photos)
    ? studio.photos.map(p => (typeof p === "string" ? p : (p.image || p.imageUrl || null))).filter(Boolean)
    : Array.isArray(studio?.galleryImages)
      ? studio.galleryImages.filter(Boolean)
      : []

  const heroImages = mainImage ? [mainImage] : (gallery.length ? gallery : ["/placeholder.svg"])
  const heroSrc = heroImages[currentImageIndex % heroImages.length]


  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites! ❤️")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const isDateBooked = (date) => {
    return bookedDates.some(booking => {
      const bookingStart = new Date(booking.bookedFrom)
      const bookingEnd = new Date(booking.bookedTill)
      const checkDate = new Date(date)
      return checkDate >= bookingStart && checkDate <= bookingEnd
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading studio details...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Studio Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/studios")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Back to Studios
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/studios")}
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Studios</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFavorite}
                className="p-2 rounded-full bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Studio Image (mainImage only) */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-50">
              <img
                src={heroSrc}
                alt={studio.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Title overlay */}
              <div className="absolute left-6 bottom-6 text-white">
                <h2 className="text-2xl font-bold drop-shadow">{studio.name}</h2>
                {studio.location && (
                  <div className="flex items-center text-sm text-white/90 mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-white/90" />
                    <span>{studio.location}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Studio Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-800">{studio.name}</h1>
              </div>
              
              {studio.location && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                  <span className="text-lg">{studio.location}</span>
                </div>
              )}

              <p className="text-gray-600 leading-relaxed mb-6">
                {studio.description}
              </p>

              {/* Studio Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  <span className="font-semibold">{totalBookings} bookings</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">4.8 rating</span>
                </div>
              </div>

              {/* Price */}
              {studio.price && (
                <div className="mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${studio.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-lg ml-2">per session</span>
                </div>
              )}

              {/* Booking Dates Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Dates</h3>
                {selectedBookingDates ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">Dates Selected</p>
                        <p className="text-green-600 text-sm">
                          {new Date(selectedBookingDates.from).toLocaleDateString()} - {new Date(selectedBookingDates.till).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDatePicker(true)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Change Dates
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="w-full bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-4 hover:bg-blue-100 transition-colors"
                  >
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-800 font-medium">Select Booking Dates</p>
                    <p className="text-blue-600 text-sm">Required for studio booking</p>
                  </button>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{selectedBookingDates ? 'Add to Cart' : 'Select Dates to Continue'}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Services Section */}
        {studio.services && studio.services.length > 0 && (
          <motion.div
            className="mt-12 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Camera className="w-6 h-6 mr-3 text-purple-600" />
              Photography Services
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studio.services.map((service, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-800">{service}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Booking Calendar Section (moved above Gallery) */}
        <motion.div
          className="mt-12 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-purple-600" />
              Booking Availability
            </h2>
            <div className="text-sm text-gray-600">
              Total bookings: {totalBookings}
            </div>
          </div>

          {bookedDates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fully Available!</h3>
              <p className="text-gray-600">This studio has no confirmed bookings yet. All dates are available!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Booked Periods:</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookedDates.map((booking, index) => (
                  <motion.div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center text-red-700 mb-2">
                      <XCircle className="w-4 h-4 mr-2" />
                      <span className="font-semibold text-sm">Unavailable</span>
                    </div>
                    <div className="text-gray-700 text-sm">
                      <div className="flex items-center mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>From: {formatDate(booking.bookedFrom)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>To: {formatDate(booking.bookedTill)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center text-green-700 mb-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-semibold text-sm">Available</span>
                </div>
                <p className="text-green-700 text-sm">
                  All other dates are available for booking. Contact us to secure your preferred date!
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Gallery Section (placed BELOW Photography Services as requested) */}
        <motion.div
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gallery</h3>

          {gallery.length === 0 ? (
            <div className="text-sm text-gray-500">No additional photos available.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {gallery.map((src, idx) => {
                // make the first gallery photo a featured large tile
                const isFeatured = idx === 0
                const containerClasses = isFeatured
                  ? "col-span-2 row-span-2 md:col-span-4 md:row-span-2 rounded-lg overflow-hidden border border-gray-100 shadow-sm"
                  : "rounded-lg overflow-hidden border border-gray-100 shadow-sm"

                // height classes: featured large, others varied
                const imgHeightClass = isFeatured ? "h-80 md:h-[420px]" : (idx % 3 === 0 ? "h-44 md:h-56" : "h-36 md:h-48")

                return (
                  <div
                    key={idx}
                    className={`${containerClasses} transform transition hover:scale-105`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => {}}
                  >
                    <img
                      src={src || "/placeholder.svg"}
                      alt={`gallery-${idx}`}
                      className={`w-full ${imgHeightClass} object-cover`}
                      loading="lazy"
                    />
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-purple-600" />
            Why Choose Us?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Award className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Professional Excellence</h4>
                <p className="text-gray-600 text-sm">Award-winning photography with years of experience in capturing life's most precious moments.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Quality Guarantee</h4>
                <p className="text-gray-600 text-sm">100% satisfaction guaranteed with professional editing and high-resolution delivery.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Timely Delivery</h4>
                <p className="text-gray-600 text-sm">Professional editing and delivery of your photos within 2-3 weeks of your session.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateRangePicker
          onDateSelect={handleDateSelection}
          onClose={() => setShowDatePicker(false)}
          bookedDates={bookedDates}
          minDate={new Date()}
        />
      )}
    </div>
  )
}

export default StudioDetails