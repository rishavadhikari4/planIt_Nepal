import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { editVenue, getVenueById, addVenuePhotos, deleteVenuePhoto } from "../../services/venues"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, FileText, ImageIcon, Upload, Save, Eye, X, Banknote, Users, Building2 } from "lucide-react"

const EditVenue = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    capacity: "",
    price: "",
    venueImage: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedPhotos, setSelectedPhotos] = useState([]) 
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [currentPhotos, setCurrentPhotos] = useState([])
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await getVenueById(id)
        if (response && response.data) {
          const { venue } = response.data
          const { name, location, description, capacity, price, venueImage, photos } = venue
          setFormData({ name, location, description, capacity: capacity || "", price, venueImage })
          setCurrentPhotos(photos || [])
        } else {
          toast.error("Venue not found")
          navigate("/admin-venues")
        }
      } catch (err) {
        console.error("Error fetching venue:", err)
        toast.error("Failed to load the venue data")
        navigate("/admin-venues")
      } finally {
        setLoading(false)
      }
    }
    
    fetchVenue()

    return () => {
      photoPreviews.forEach(p => URL.revokeObjectURL(p.url));
    }
  }, [id, navigate])

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

  // --- Multi-photo handlers ---
  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newFiles = files.slice(0, 10)
    const newPreviews = newFiles.map(file => ({ url: URL.createObjectURL(file), name: file.name }))

    setSelectedPhotos(prev => [...prev, ...newFiles])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  const removePreview = (index) => {
    setPhotoPreviews(prev => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed.url)
      const next = prev.slice(0, index).concat(prev.slice(index + 1))
      return next
    })
    setSelectedPhotos(prev => prev.slice(0, index).concat(prev.slice(index + 1)))
  }

  const uploadPhotos = async () => {
    if (!selectedPhotos.length) {
      toast.info("Select photos to upload")
      return
    }
    setUploadingPhotos(true)

    try {
      addVenuePhotos(id, selectedPhotos, 
        (successMessage, data) => {
          toast.success(successMessage)
          const updatedVenue = data?.venue || data
          const newGallery = updatedVenue?.photos || updatedVenue?.data?.photos || []
          setCurrentPhotos(Array.isArray(newGallery) ? newGallery : currentPhotos)
          
          // Clear selected photos and previews
          photoPreviews.forEach(p => URL.revokeObjectURL(p.url))
          setSelectedPhotos([])
          setPhotoPreviews([])
        },
        (errorMessage) => {
          toast.error(errorMessage)
        }
      )
    } catch (err) {
      console.error("Error uploading photos:", err)
      toast.error("Failed to upload photos")
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!photoId) return
    if (!window.confirm("Delete this photo?")) return

    setDeletingPhotoId(photoId)
    
    try {
      deleteVenuePhoto(id, photoId,
        (successMessage, updatedVenue) => {
          toast.success(successMessage || "Photo deleted successfully")
          const newGallery = updatedVenue?.photos || updatedVenue?.data?.photos || []
          setCurrentPhotos(Array.isArray(newGallery) ? newGallery : currentPhotos.filter(p => p._id !== photoId))
        },
        (errorMessage) => {
          toast.error(errorMessage)
        }
      )
    } catch (err) {
      console.error("Error deleting photo:", err)
      toast.error("Failed to delete photo")
    } finally {
      setDeletingPhotoId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location || !formData.description || !formData.capacity || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    const data = new FormData()
    data.append("name", formData.name)
    data.append("location", formData.location)
    data.append("description", formData.description)
    data.append("capacity", formData.capacity)
    data.append("price", formData.price)
    if (imageFile) {
      data.append("image", imageFile)
    }

    try {
      await editVenue(
        id,
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
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate("/admin-venues")
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
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
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
              Back to Venues
            </motion.button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Edit Venue
            </h1>
            <p className="text-gray-600">Update your venue information and details</p>
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
                {/* Venue Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter venue name..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter venue location..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                {/* Capacity and Price Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Capacity */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Users className="w-4 h-4 text-purple-600" />
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="Guest capacity..."
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
                      placeholder="Price per event..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800"
                    />
                  </div>
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
                    placeholder="Describe your venue..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-800 resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                {/* Current Image */}
                {formData.venueImage && !imagePreview && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Eye className="w-4 h-4 text-purple-600" />
                      Current Image
                    </label>
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={formData.venueImage || "/placeholder.svg"}
                        alt="Current venue"
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
                    {imagePreview ? "New Image Preview" : "Upload New Image"}
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

                {/* Multi-photo upload section */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    Upload Additional Photos (Gallery)
                  </label>

                  {/* File input */}
                  <div className="mb-3">
                    <input
                      type="file"
                      onChange={handlePhotosChange}
                      accept="image/*"
                      multiple
                      className="w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-white file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 hover:file:from-purple-700 hover:file:to-pink-700 file:font-semibold file:transition-all file:duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-2">Select one or more images to add to the venue gallery (up to 10 per upload)</p>
                  </div>

                  {/* Preview selected photos */}
                  {photoPreviews.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {photoPreviews.map((p, idx) => (
                          <div key={idx} className="relative rounded-md overflow-hidden border border-gray-200">
                            <img src={p.url} alt={p.name} className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => removePreview(idx)}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={uploadPhotos}
                          disabled={uploadingPhotos}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow hover:opacity-95 disabled:opacity-60"
                        >
                          {uploadingPhotos ? "Uploading..." : <>
                            <Upload className="w-4 h-4" /> Upload Photos
                          </>}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            photoPreviews.forEach(p => URL.revokeObjectURL(p.url));
                            setSelectedPhotos([])
                            setPhotoPreviews([])
                          }}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Current gallery photos */}
                  {currentPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Photos</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentPhotos.map((p, idx) => {
                          const src = p.image || "/placeholder.svg"
                          const photoId = p._id
                          
                          console.log('Photo object:', p, 'Using _id:', photoId)
                          
                          return (
                            <div key={photoId || idx} className="relative rounded-md overflow-hidden border border-gray-200">
                              <img src={src} alt={`photo-${idx}`} className="w-full h-28 object-cover" />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (photoId) handleDeletePhoto(photoId)
                                  }}
                                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                  title="Delete photo"
                                  disabled={deletingPhotoId === photoId || !photoId}
                                >
                                  {deletingPhotoId === photoId ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        })}
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

                {/* Venue Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Venue Details:</h4>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>• Capacity: {formData.capacity || "Not set"} guests</div>
                    <div>• Price: ${formData.price || "0"} per event</div>
                    <div>• Location: {formData.location || "Not specified"}</div>
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
                    Updating Venue...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Venue
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
          <p>Make sure all information is accurate before updating the venue.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default EditVenue
