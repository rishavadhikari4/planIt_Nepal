"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { addVenue } from "../../services/venues"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, MapPin, FileText, Upload, X, ImageIcon, Plus, Banknote, Users } from "lucide-react"

const AddVenue = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    capacity: "",
    price: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        toast.error("Please upload an image file")
      }
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.location || !formData.description || !formData.capacity || !formData.price || !imageFile) {
      toast.error("Please fill in all fields and select an image")
      return
    }

    setLoading(true)
    const data = new FormData()
    data.append("name", formData.name)
    data.append("location", formData.location)
    data.append("description", formData.description)
    data.append("capacity", formData.capacity)
    data.append("price", formData.price)
    data.append("image", imageFile)

    try {
      await addVenue(
        data,
        (successMessage) => {
          toast.success(successMessage)
          navigate("/admin-venues")
        },
        (errorMessage) => {
          toast.error(errorMessage)
        },
      )
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/admin-venues")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <motion.button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md mb-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Venues</span>
          </motion.button>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Add New Venue
            </h1>
            <p className="text-gray-600">Create a new wedding venue listing</p>
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Venue Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Venue Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter venue name"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Location *</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter venue location"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </motion.div>

                {/* Capacity and Price Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Capacity */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Capacity *</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="Guest capacity"
                      required
                      min="1"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                    />
                  </motion.div>

                  {/* Price */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <Banknote className="w-4 h-4 text-purple-600" />
                      <span>Price *</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Price per event"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                    />
                  </motion.div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Description *</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the venue features and amenities"
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                  />
                </motion.div>
              </div>

              {/* Right Column - Image Upload */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-6"
              >
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Venue Image *</span>
                </label>

                {/* Image Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                    dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 text-center cursor-pointer" onClick={handleFileButtonClick}>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>

                {imageFile && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">Image selected: {imageFile.name}</span>
                    </div>
                  </div>
                )}

                {/* Form Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Required Fields:</h4>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Venue name and location</li>
                    <li>• Guest capacity (number)</li>
                    <li>• Price per event</li>
                    <li>• Detailed description</li>
                    <li>• High-quality venue image</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={`w-full lg:w-auto lg:min-w-[200px] px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Venue...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Venue</span>
                  </div>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AddVenue
