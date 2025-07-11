import { useState, useEffect } from "react"
import { getAllDecorations } from "../services/decorationService"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { toast } from "react-toastify"
import { Flower, ShoppingCart, Search, Filter, Heart, Check, Star, Palette, Sparkles, Eye, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Decorations = () => {
  const [decorations, setDecorations] = useState([])
  const [selectedDecoration, setSelectedDecoration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [favorites, setFavorites] = useState(new Set())
  const [showPreview, setShowPreview] = useState(null)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const data = await getAllDecorations()
        setDecorations(data)
      } catch (err) {
        console.error("Failed to fetch decorations:", err)
        toast.error("Failed to load decorations.")
      } finally {
        setLoading(false)
      }
    }
    fetchDecorations()
  }, [])

  const handleSubmit = () => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      toast.info("Please login to add items to the cart")
      navigate("/login")
      return
    }

    if (selectedDecoration) {
      const decoration = decorations.find((d) => d.name === selectedDecoration)
      if (decoration) {
        toast.success("Added to cart successfully! ✨")
        addToCart({
          name: decoration.name,
          price: decoration.price || 0,
          image: decoration.image,
          quantity: 1,
          type: "decoration",
          theme: decoration.theme,
        })
      }
      setSelectedDecoration(null)
    }
  }

  const toggleFavorite = (decorationName) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(decorationName)) {
      newFavorites.delete(decorationName)
      toast.info("Removed from favorites")
    } else {
      newFavorites.add(decorationName)
      toast.success("Added to favorites! ❤️")
    }
    setFavorites(newFavorites)
  }

  // Filter decorations based on search and theme
  const filteredDecorations = decorations.filter((decoration) => {
    const matchesSearch =
      decoration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decoration.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTheme = selectedTheme === "all" || decoration.theme === selectedTheme
    return matchesSearch && matchesTheme
  })

  // Get unique themes
  const themes = ["all", ...new Set(decorations.map((decoration) => decoration.theme).filter(Boolean))]

  if (loading)
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
            Loading beautiful decorations...
          </p>
        </motion.div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Flower className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Wedding Decoration Themes
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your venue into a magical wonderland with our stunning decoration themes. From elegant florals to
            modern minimalist designs, find the perfect style for your special day.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search decoration themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>

              {/* Theme Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="pl-12 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer min-w-[200px]"
                >
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme === "all" ? "All Themes" : theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedDecoration && (
              <motion.div
                className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-semibold">Selected: {selectedDecoration}</span>
                  <button
                    onClick={() => setSelectedDecoration(null)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Clear Selection
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-purple-600">{filteredDecorations.length}</span> of{" "}
                <span className="font-semibold">{decorations.length}</span> decoration themes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Decorations Grid */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {filteredDecorations.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No decorations found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTheme("all")
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <AnimatePresence>
                {filteredDecorations.map((decoration, index) => (
                  <motion.div
                    key={decoration._id}
                    className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border transition-all duration-500 overflow-hidden cursor-pointer ${
                      selectedDecoration === decoration.name
                        ? "ring-4 ring-purple-500 border-purple-300 scale-105"
                        : "border-white/20 hover:border-purple-200 hover:scale-102"
                    }`}
                    onClick={() => setSelectedDecoration(decoration.name)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    layout
                    whileHover={{ y: -5 }}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <img
                        src={decoration.image || "/placeholder.svg?height=300&width=400"}
                        alt={decoration.name}
                        className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(decoration.name)
                          }}
                          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors duration-200 ${
                              favorites.has(decoration.name)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-600 hover:text-red-500"
                            }`}
                          />
                        </button>

                        {/* Preview Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPreview(decoration)
                          }}
                          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        >
                          <Eye className="w-5 h-5 text-gray-600 hover:text-purple-600" />
                        </button>
                      </div>

                      {/* Theme Badge */}
                      {decoration.theme && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {decoration.theme}
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {selectedDecoration === decoration.name && (
                        <motion.div
                          className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Decoration Name */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {decoration.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {decoration.description || "A beautiful decoration theme perfect for your special day."}
                      </p>

                      {/* Features */}
                      <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                        {decoration.includes && (
                          <div className="flex items-center">
                            <Palette className="w-3 h-3 mr-1" />
                            <span>{decoration.includes} items</span>
                          </div>
                        )}
                        {decoration.rating && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                            <span>{decoration.rating}</span>
                          </div>
                        )}
                        {decoration.capacity && (
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{decoration.capacity} guests</span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      {decoration.price && (
                        <div className="mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ${decoration.price.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">complete setup</span>
                        </div>
                      )}

                      {/* Selection Radio */}
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl">
                        <input
                          type="radio"
                          id={`decoration-${decoration._id}`}
                          name="decoration"
                          value={decoration.name}
                          checked={selectedDecoration === decoration.name}
                          onChange={() => setSelectedDecoration(decoration.name)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2"
                        />
                        <label
                          htmlFor={`decoration-${decoration._id}`}
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {selectedDecoration === decoration.name ? "Selected Theme" : "Select This Theme"}
                        </label>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Bottom CTA Section */}
        {filteredDecorations.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Need Custom Decorations?
              </h3>
              <p className="text-gray-600 mb-6">
                Our design team can create bespoke decoration themes tailored to your unique vision and venue.
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Contact Our Designers
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Add to Cart Button */}
      <AnimatePresence>
        {selectedDecoration && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Add to Cart</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={showPreview.image || "/placeholder.svg"}
                  alt={showPreview.name}
                  className="w-full h-64 sm:h-80 object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setShowPreview(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{showPreview.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{showPreview.description}</p>
                {showPreview.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${showPreview.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDecoration(showPreview.name)
                        setShowPreview(null)
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      Select Theme
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Decorations
