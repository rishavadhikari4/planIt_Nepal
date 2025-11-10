import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Send } from 'lucide-react'
import { toast } from 'react-toastify'
import { rateVenue, rateStudio, rateDish } from '../../services/reviews'

const RatingModal = ({ 
  isOpen, 
  onClose, 
  item, 
  itemType, 
  onRatingSubmitted 
}) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleStarClick = (starRating) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating) => {
    setHoveredRating(starRating)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      let response
      switch (itemType) {
        case 'venue':
            console.log(item._id);
          response = await rateVenue(item.itemId, rating)
          
          break
        case 'studio':
          response = await rateStudio(item.itemId, rating)
          break
        case 'dish':
        case 'cuisine':
          response = await rateDish(item.itemId, rating)
          break
        default:
          throw new Error('Invalid item type')
      }

      toast.success(response.message || 'Rating submitted successfully!')
      
      if (onRatingSubmitted) {
        onRatingSubmitted(item.itemId, rating)
      }
      
      onClose()
      setRating(0)
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error(error.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Rate {itemType === 'cuisine' ? 'Dish' : itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Item Info */}
            <div className="flex items-center space-x-4">
              <img
                src={item.image || item.dishImage || item.venueImage || "/placeholder.svg"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{itemType}</p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-3">How was your experience?</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="transition-all duration-200 transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  className="text-sm text-gray-600 mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </motion.p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-200"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Submit Rating</span>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RatingModal