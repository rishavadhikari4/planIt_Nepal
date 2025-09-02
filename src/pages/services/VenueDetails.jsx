import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { motion } from "framer-motion"
import { 
  MapPin, 
  Users, 
  Star, 
  ArrowLeft, 
  ShoppingCart, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  Heart,
  Share2,
  Phone,
  Mail,
  Shield,
  Award,
  Building
} from "lucide-react"
import { toast } from "react-toastify"
import {getVenueById} from "../../services/venues"
import DateRangePicker from '../../components/ui/DateRangePicker';

const VenueDetails = () => {
  const { venueId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [venue, setVenue] = useState(null)
  const [bookedDates, setBookedDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedBookingDates, setSelectedBookingDates] = useState(null)

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true)
        const response = await getVenueById(venueId);
        if (response.success) {
          setVenue(response.data.venue)
          setBookedDates(response.data.bookedDates || [])
        } else {
          setError("Venue not found")
        }
      } catch (err) {
        console.error("Error fetching venue details:", err)
        setError("Failed to load venue details")
        toast.error("Failed to load venue details")
      } finally {
        setLoading(false)
      }
    }

    if (venueId) {
      fetchVenueDetails()
    }
  }, [venueId])

  const handleAddToCart = () => {
    const accessToken = localStorage.getItem("accessToken")
    
    if (!accessToken) {
      toast.info("Please login to add items to the cart")
      navigate("/login")
      return
    }

    if (!selectedBookingDates) {
      setShowDatePicker(true)
      return
    }

    try {
      const venueItem = {
        _id: venue._id,
        name: venue.name,
        price: venue.price,
        image: venue.venueImage,
        type: "venue",
        description: venue.description,
        location: venue.location,
        capacity: venue.capacity,
        quantity: 1
      }

      addToCart(venueItem, selectedBookingDates)
      
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add venue to cart")
    }
  }

  const handleDateSelection = (dates) => {
    setSelectedBookingDates(dates)
    toast.success('Booking dates selected!')
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites! ❤️")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            Loading venue details...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <motion.div
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/venues')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Back to Venues
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
              onClick={() => navigate('/venues')}
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Venues</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFavorite}
                className="p-2 rounded-full bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              </button>
              <button className="p-2 rounded-full bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={venue.venueImage || "/placeholder.svg"}
                alt={venue.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Venue Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-800">{venue.name}</h1>
              </div>
              
              {venue.location && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                  <span className="text-lg">{venue.location}</span>
                </div>
              )}

              <p className="text-gray-600 leading-relaxed mb-6">
                {venue.description || "A beautiful venue perfect for your special day."}
              </p>

              {/* Venue Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {venue.capacity && (
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-2 text-purple-500" />
                    <span className="font-semibold">{venue.capacity} guests</span>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">4.8 rating</span>
                </div>
              </div>

              {/* Price */}
              {venue.price && (
                <div className="mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${venue.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-lg ml-2">per event</span>
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
                    <p className="text-blue-600 text-sm">Required for venue booking</p>
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

        {/* Booking Calendar Section */}
        <motion.div
          className="mt-12 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-purple-600" />
              Booking Availability
            </h2>
            <div className="text-sm text-gray-600">
              Total bookings: {bookedDates.length}
            </div>
          </div>

          {bookedDates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fully Available!</h3>
              <p className="text-gray-600">This venue has no confirmed bookings yet. All dates are available!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Booked Dates:</h3>
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

        {/* Why Choose Us Section */}
        <motion.div
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-purple-600" />
            Why Choose Us?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Award className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Premium Venues</h4>
                <p className="text-gray-600 text-sm">Carefully selected venues with exceptional quality and stunning locations for your perfect day.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Full Service Support</h4>
                <p className="text-gray-600 text-sm">Complete planning assistance from booking to event day with dedicated support team.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Flexible Capacity</h4>
                <p className="text-gray-600 text-sm">Venues suitable for intimate gatherings to grand celebrations with flexible arrangements.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ready to Book?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-6">
                Contact our wedding planning team to discuss your requirements and secure your booking for this beautiful venue.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-3 text-purple-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-3 text-purple-600" />
                  <span>bookings@weddingplanner.com</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Contact Us Now
              </button>
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

export default VenueDetails