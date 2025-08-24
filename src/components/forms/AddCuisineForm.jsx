"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { addDish, getAllCuisines } from "../../services/cuisines"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { ArrowLeft, ChefHat, Tag, FileText, Upload, X, ImageIcon, Plus, Utensils, Banknote } from "lucide-react"

const AddCuisineForm = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price:"",
    description: "",
  })

  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCuisines()
        if (response.success && response.cuisines) {
          const categoryNames = response.cuisines.map((cat) => cat.category)
          setCategories([...new Set(categoryNames)]) // Remove duplicates
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        toast.error("Failed to fetch categories")
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "categorySelect") {
      if (value === "Other") {
        setIsCustomCategory(true)
        setFormData((prev) => ({ ...prev, category: "" }))
      } else {
        setIsCustomCategory(false)
        setFormData((prev) => ({ ...prev, category: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
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
        toast.error("Please select an image file")
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
    const { category, name, price, description } = formData

    if (!category || !name || !price || !description || !imageFile) {
      toast.error("Please fill in all required fields and select an image")
      return
    }

    setLoading(true)
    const data = new FormData()
    data.append("name", name)
    data.append("price", price)
    data.append("description", description)
    data.append("image", imageFile)

    try {
      // Pass category as route parameter and FormData as body
      await addDish(
        category,
        data,
        (successMessage) => {
          toast.success(successMessage)
          navigate("/admin-cuisines")
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
    navigate("/admin-cuisines")
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
            <span className="font-medium">Back to Dishes</span>
          </motion.button>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Add New Dish
            </h1>
            <p className="text-gray-600">Create a new delicious dish for your menu</p>
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
                {/* Category Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span>Category</span>
                  </label>
                  <select
                    name="categorySelect"
                    value={isCustomCategory ? "Other" : formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </motion.div>

                {/* Custom Category Input */}
                {isCustomCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <ChefHat className="w-4 h-4 text-purple-600" />
                      <span>Custom Category</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Enter custom category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                    />
                  </motion.div>
                )}

                {/* Dish Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Utensils className="w-4 h-4 text-purple-600" />
                    <span>Dish Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter dish name"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </motion.div>
                
                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Banknote className="w-4 h-4 text-purple-600" />
                    <span>Dish Price</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter Dish Price"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the dish ingredients and preparation"
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                  />
                </motion.div>
              </div>

              {/* Right Column - Image Upload */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-6"
              >
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Dish Image</span>
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
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
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
                    <span>Adding Dish...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Dish</span>
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

export default AddCuisineForm
