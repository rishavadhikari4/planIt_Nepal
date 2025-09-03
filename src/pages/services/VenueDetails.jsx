import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { motion, AnimatePresence } from "framer-motion"
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
  Building,
  Camera,
  ZoomIn,
  Grid3X3,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
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
  const [totalBookings, setTotalBookings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedBookingDates, setSelectedBookingDates] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Gallery states
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [galleryView, setGalleryView] = useState('masonry')

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true)
        const response = await getVenueById(venueId);
        if (response.success) {
          setVenue(response.data.venue)
          setBookedDates(response.data.bookedDates || [])
          setTotalBookings(response.data.totalBookings || 0)
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

  // Gallery functions
  const mainImage = venue?.venueImage || "/placeholder.svg";

  // Handle the exact photos structure: Array of objects with { image, imageId, _id }
  const gallery = Array.isArray(venue?.photos)
    ? venue.photos.map(photo => photo.image).filter(Boolean)
    : []

  const allImages = [mainImage, ...gallery].filter(Boolean)
  const heroImages = mainImage ? [mainImage] : (gallery.length ? gallery : ["/placeholder.svg"])
  const heroSrc = heroImages[currentImageIndex % heroImages.length]

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Gallery animation variants
  const galleryVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20 
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const lightboxVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
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
                src={heroSrc}
                alt={venue.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Hero image overlay */}
              <div className="absolute left-6 bottom-6 text-white">
                <h2 className="text-2xl font-bold drop-shadow">{venue.name}</h2>
                {venue.location && (
                  <div className="flex items-center text-sm text-white/90 mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-white/90" />
                    <span>{venue.location}</span>
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
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  <span className="font-semibold">{totalBookings} bookings</span>
                </div>
              </div>

              {/* Price */}
              {venue.price && (
                <div className="mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{venue.price.toLocaleString()}
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
              Total bookings: {totalBookings}
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

        {/* Gallery Section - Only show if there are additional images */}
        {allImages.length > 1 && (
          <motion.div
            className="mt-12 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Venue Gallery</h2>
                  <p className="text-gray-600 text-sm">{allImages.length} professional photos</p>
                </div>
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex items-center space-x-2 bg-gray-100/80 rounded-2xl p-1">
                <button
                  onClick={() => setGalleryView('masonry')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    galleryView === 'masonry' 
                      ? 'bg-white shadow-sm text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGalleryView('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    galleryView === 'grid' 
                      ? 'bg-white shadow-sm text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gallery Content */}
            <motion.div
              variants={galleryVariants}
              initial="hidden"
              animate="visible"
            >
              {galleryView === 'masonry' ? (
                /* Masonry Layout */
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                  {allImages.map((image, index) => (
                    <motion.div
                      key={index}
                      variants={imageVariants}
                      className="break-inside-avoid mb-6 group cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-100">
                        <img
                          src={image}
                          alt={`Venue gallery ${index + 1}`}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between text-white">
                              <span className="text-sm font-medium">Photo {index + 1}</span>
                              <div className="flex items-center space-x-2">
                                <ZoomIn className="w-4 h-4" />
                                <span className="text-xs">Click to view</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Zoom Icon */}
                        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <ZoomIn className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Grid Layout */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {allImages.map((image, index) => (
                    <motion.div
                      key={index}
                      variants={imageVariants}
                      className="aspect-square group cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-100">
                        <img
                          src={image}
                          alt={`Venue gallery ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                            <ZoomIn className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* View All Photos Button */}
            {allImages.length > 8 && (
              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <button
                  onClick={() => openLightbox(0)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  <span>View All {allImages.length} Photos</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Why Choose Us Section */}
        <motion.div
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
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
          transition={{ duration: 0.6, delay: 1.0 }}
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center px-4"
              variants={lightboxVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <motion.button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20"
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </>
              )}

              {/* Main Image */}
              <motion.img
                key={lightboxIndex}
                src={allImages[lightboxIndex]}
                alt={`Venue photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-6 py-3 text-white border border-white/20">
                <span className="text-sm font-medium">
                  {lightboxIndex + 1} of {allImages.length}
                </span>
              </div>

              {/* Thumbnail Navigation (for smaller galleries) */}
              {allImages.length > 1 && allImages.length <= 10 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2">
                  {allImages.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setLightboxIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === lightboxIndex
                          ? 'border-white shadow-lg'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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