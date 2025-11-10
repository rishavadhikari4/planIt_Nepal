import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { submitContactForm } from "../../services/contact"

const ContactForm = ({ 
  title = "Send Us a Message", 
  description = "Fill out the form below and we'll get back to you within 24 hours to discuss your event planning needs.",
  className = "",
  onSubmitSuccess,
  compact = false
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    budget: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    try {
      // Submit form data to backend
      const result = await submitContactForm(formData)

      if (result.success) {
        toast.success(result.message || "Message sent successfully! We'll get back to you soon. 💌")
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          budget: "",
          message: "",
        })

        // Call optional success callback
        if (onSubmitSuccess) {
          onSubmitSuccess(formData)
        }
      } else {
        toast.error(result.message || "Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const subjectOptions = [
    { value: "", label: "Select a subject" },
    { value: "wedding-planning", label: "Wedding Planning" },
    { value: "corporate-event", label: "Corporate Event" },
    { value: "birthday-party", label: "Birthday Party" },
    { value: "anniversary-celebration", label: "Anniversary Celebration" },
    { value: "graduation-party", label: "Graduation Party" },
    { value: "baby-shower", label: "Baby Shower" },
    { value: "conference-seminar", label: "Conference/Seminar" },
    { value: "photography-inquiry", label: "Photography Services" },
    { value: "catering-inquiry", label: "Catering Services" },
    { value: "venue-rental", label: "Venue Rental" },
    { value: "pricing-inquiry", label: "Pricing Inquiry" },
    { value: "others", label: "Others" },
  ]

  const budgetOptions = [
    { value: "", label: "Select your budget range" },
    { value: "10000-25000", label: "Rs 10,000 -Rs 25,000" },
    { value: "25000-50000", label: "Rs 25,000 -Rs 50,000" },
    { value: "50000-100000", label: "Rs 50,000 -Rs 1,00,000" },
    { value: "100000-200000", label: "Rs 1,00,000 -Rs 2,00,000" },
    { value: "200000-500000", label: "Rs 2,00,000 -Rs 5,00,000" },
    { value: "500000-1000000", label: "Rs 5,00,000 -Rs 10,00,000" },
    { value: "1000000+", label: "Rs 10,00,000+" },
  ]

  return (
    <motion.div
      className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 ${compact ? 'p-6' : 'p-8 sm:p-10'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className={compact ? "mb-6" : "mb-8"}>
        <h2 className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4`}>
          {title}
        </h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email Row */}
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
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        {/* Phone and Subject Row */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="(977) 123-4567"
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
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget Field - Full Width */}
        <div>
          <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
            Event Budget *
          </label>
          <select
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {budgetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            This helps us recommend the best services within your budget range.
          </p>
        </div>

        {/* Message */}
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
            disabled={isSubmitting}
            rows={compact ? 4 : 5}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Tell us about your event, preferred dates, guest count, specific requirements, and any other details that will help us plan your perfect event..."
          />
        </div>

        {/* Submit Button */}
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
  )
}

export default ContactForm