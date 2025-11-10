import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllCuisines, deleteDish, deleteCuisine } from "../../services/cuisines"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Filter, Edit3, Trash2, ChefHat, Star, Clock, Users, Eye } from "lucide-react"

const AdminCuisine = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingDishId, setDeletingDishId] = useState(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllCuisines()
        const categoriesData = response.cuisines || []
        setCategories(categoriesData)
      } catch (err) {
        console.error("Failed to fetch cuisines:", err)
        if (!Array.isArray(err.response?.data) || err.response?.data.length > 0) {
          toast.error("Failed to fetch cuisines")
        }
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeleteDish = async (categoryId, dishId) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return

    setDeletingDishId(dishId)
    try {
      await deleteDish(
        categoryId,
        dishId,
        (successMessage, updatedCategory) => {
          if (updatedCategory) {
            // If backend returns updated category, use it
            setCategories((prevCategories) =>
              prevCategories.map((category) => 
                category._id === categoryId ? updatedCategory : category
              )
            )
          } else {
            // If no updated category, manually remove the dish
            setCategories((prevCategories) =>
              prevCategories.map((category) => {
                if (category._id === categoryId) {
                  return {
                    ...category,
                    dishes: category.dishes.filter(dish => dish._id !== dishId)
                  }
                }
                return category
              })
            )
          }
          toast.success(successMessage)
        },
        (errorMessage) => {
          toast.error(errorMessage)
        },
      )
    } catch (error) {
      toast.error("Something went wrong while deleting the dish.")
    } finally {
      setDeletingDishId(null)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this entire category?")) return

    setDeletingCategoryId(categoryId)
    try {
      await deleteCuisine(
        categoryId,
        (successMessage) => {
          // Remove the category from state
          setCategories((prevCategories) => 
            prevCategories.filter((category) => category._id !== categoryId)
          )
          toast.success(successMessage)
        },
        (errorMessage) => {
          toast.error(errorMessage)
        },
      )
    } catch (error) {
      toast.error("Something went wrong while deleting the category.")
    } finally {
      setDeletingCategoryId(null)
    }
  }

  // Simplified filtering logic
  const getFilteredCategories = () => {
    if (!searchTerm.trim() && selectedCategory === "all") {
      return categories
    }

    return categories
      .map((category) => ({
        ...category,
        dishes: (category.dishes || []).filter((dish) => {
          const matchesSearch = !searchTerm.trim() || 
            dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
          
          const matchesCategory = selectedCategory === "all" || category.category === selectedCategory
          
          return matchesSearch && matchesCategory
        })
      }))
      .filter((category) => category.dishes.length > 0)
  }

  const filteredCategories = getFilteredCategories()
  const categoryNames = ["all", ...new Set(categories.map((cat) => cat.category).filter(Boolean))]

  // Calculate real stats
  const totalDishes = categories.reduce((sum, cat) => sum + (cat.dishes?.length || 0), 0)
  const totalCategories = categories.length

  const stats = [
    { label: "Total Dishes", value: totalDishes, icon: ChefHat, color: "text-blue-600" },
    { label: "Categories", value: totalCategories, icon: Filter, color: "text-green-600" },
    { label: "Filtered", value: filteredCategories.reduce((sum, cat) => sum + cat.dishes.length, 0), icon: Search, color: "text-purple-600" },
  ]

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
  }

  const DishCard = ({ dish, categoryId, categoryName }) => (
    <motion.div
      className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-500 overflow-hidden"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={dish.dishImage || dish.image || "/placeholder.svg?height=200&width=300"}
          alt={dish.name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
          {categoryName}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
          {dish.name}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
          {dish.description || "A delicious dish perfect for your special celebration."}
        </p>

        {/* Features */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          {dish.servings && (
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span>{dish.servings} servings</span>
            </div>
          )}
          {dish.prepTime && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{dish.prepTime} min</span>
            </div>
          )}
          {dish.rating && (
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
              <span>{dish.rating}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {dish.price && (
          <div className="mb-3">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
             Rs {dish.price?.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm ml-1">per serving</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/admin-cuisines/edit/${categoryId}/${dish._id}`)}
            disabled={deletingDishId === dish._id}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => handleDeleteDish(categoryId, dish._id)}
            disabled={deletingDishId === dish._id}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {deletingDishId === dish._id ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2">
        <motion.div className="flex flex-col items-center space-y-4 p-4 max-w-xs w-full">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="w-7 h-7 border-2 border-purple-200 border-t-purple-600 rounded-full absolute top-1.5 left-1.5 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }}></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Loading...</h3>
            <p className="text-slate-500 text-xs">Fetching cuisines...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const noCuisines = categories.length === 0 || categories.every((category) => (category.dishes?.length || 0) === 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Cuisine Management
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage your wedding cuisine collection with our comprehensive dish management system. Add, edit, and organize
            delicious cuisines for your special day.
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          className="max-w-7xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <p className="text-gray-500 text-xs lg:text-sm">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {!noCuisines && (
          <>
            {/* Search and Filter Section */}
            <motion.div
              className="max-w-6xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search cuisines by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-12 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 appearance-none cursor-pointer min-w-[200px]"
                    >
                      {categoryNames.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Clear
                  </button>
                </div>

                {/* Results and Add Button */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {filteredCategories.reduce((sum, cat) => sum + cat.dishes.length, 0)} dishes found
                  </span>
                  <button
                    onClick={() => navigate("/admin-cuisines/addCuisine")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Dish</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          {noCuisines ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No cuisines available</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your cuisine collection by adding your first delicious dish.
              </p>
              <button
                onClick={() => navigate("/admin-cuisines/addCuisine")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus className="w-6 h-6" />
                <span>Add Your First Dish</span>
              </button>
            </motion.div>
          ) : filteredCategories.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No dishes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="space-y-12">
              <AnimatePresence>
                {filteredCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={category._id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
                    layout
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                          <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {category.category?.charAt(0).toUpperCase() + category.category?.slice(1)}
                          </h2>
                          <p className="text-gray-600">{category.dishes?.length || 0} dishes available</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        disabled={deletingCategoryId === category._id}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 shadow-lg"
                      >
                        {deletingCategoryId === category._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Category</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Dishes Grid */}
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <AnimatePresence>
                        {(category.dishes || []).map((dish, dishIndex) => (
                          <motion.div
                            key={dish._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: dishIndex * 0.05, duration: 0.4 }}
                            layout
                          >
                            <DishCard dish={dish} categoryId={category._id} categoryName={category.category} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCuisine