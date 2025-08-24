import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getDishById, updateDish } from "../../services/cuisines"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { ArrowLeft, ChefHat, FileText, ImageIcon, Upload, Save, Eye, X, Banknote } from "lucide-react"

const EditCuisines = () => {
  const { categoryId, dishId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await getDishById(dishId)
        if (data && data.dish) {
          const { dish } = data
          const { name, description, price, image } = dish
          setFormData({ name, description, price, image })
        } else {
          toast.error("Dish not found")
          navigate("/admin-cuisines")
        }
      } catch (err) {
        console.error("Error fetching dish:", err)
        toast.error("Failed to load the dish data")
        navigate("/admin-cuisines")
      } finally {
        setLoading(false)
      }
    }
    fetchDish()
  }, [dishId, navigate])

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
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImagePreview = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    const data = new FormData()
    data.append("name", formData.name)
    data.append("description", formData.description)
    data.append("price", formData.price)
    if (imageFile) {
      data.append("image", imageFile)
    }

    try {
      await updateDish(
        categoryId,
        dishId,
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
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate("/admin-cuisines")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full absolute top-2 left-2 animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Cuisines
            </motion.button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Edit Dish
            </h1>
            <p className="text-gray-600">Update your dish information and details</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Dish Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <ChefHat className="w-4 h-4 text-purple-600" />
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter dish name..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Banknote className="w-4 h-4 text-purple-600" />
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Price per dish..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe your dish..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                {/* Current Image */}
                {formData.image && !imagePreview && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Eye className="w-4 h-4 text-purple-600" />
                      Current Image
                    </label>
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Current dish"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    {imagePreview ? "New Image Preview" : "Upload New Image (Optional)"}
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <button
                        type="button"
                        onClick={removeImagePreview}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-2">Click to upload new image</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Button for Mobile */}
                {!imagePreview && (
                  <div className="lg:hidden">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-white file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 hover:file:from-purple-700 hover:file:to-pink-700 file:font-semibold file:transition-all file:duration-200"
                    />
                  </div>
                )}

                {/* Dish Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Dish Details:</h4>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>• Price: ${formData.price || "0"} per dish</div>
                    <div>• Name: {formData.name || "Not specified"}</div>
                    <div>• Description: {formData.description ? `${formData.description.slice(0, 50)}...` : "Not provided"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <motion.button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
                whileHover={!submitting ? { scale: 1.02, y: -2 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating Dish...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Dish
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-6 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p>Make sure all information is accurate before updating the dish.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default EditCuisines
