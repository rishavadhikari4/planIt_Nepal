"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, MessageSquare, User, FileText, ArrowLeft } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { getContactById } from "../../services/contact"
import { motion, AnimatePresence } from "framer-motion"

const ContactDetails = () => {
  const [contact, setContact] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { contactId } = useParams()

  const fetchContact = async (id) => {
    try {
      setIsLoading(true)
      const response = await getContactById(id)
      setContact(response.data.contact)
    } catch (error) {
      console.error("Error fetching contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contactId) fetchContact(contactId)
  }, [contactId])

  const handleBack = () => {
    navigate("/admin-contact")
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const fieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const buttonVariants = {
    hover: {
      scale: 1.02,
      y: -1,
      transition: {
        duration: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.05,
      },
    },
  }

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 3,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            variants={loadingVariants}
            animate="animate"
          />
          <motion.p
            className="text-slate-600 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Loading contact details...
          </motion.p>
        </div>
      </motion.div>
    )
  }

  if (!contact) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
          >
            <User className="w-10 h-10 text-red-500" />
          </motion.div>
          <p className="text-slate-600 text-lg font-medium">Contact not found</p>
        </div>
      </motion.div>
    )
  }

  const contactFields = [
    { icon: Mail, label: "Email", value: contact.email, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Phone, label: "Phone", value: contact.phone, color: "text-green-600", bg: "bg-green-50" },
    { icon: FileText, label: "Subject", value: contact.subject, color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Rs, label: "Budget", value: contact.budget, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="bg-white shadow-sm border-b border-slate-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <motion.button
            className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors duration-150 mb-2"
            whileHover={{ x: -3 }}
            transition={{ duration: 0.1 }}
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to contacts
          </motion.button>

          <motion.h1
            className="text-2xl font-bold text-slate-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Contact Details
          </motion.h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Header */}
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white relative overflow-hidden"
            variants={cardVariants}
          >
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <motion.div
              className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-32 h-32 bg-white opacity-5 rounded-full"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            <div className="relative z-10">
              <motion.h2
                className="text-4xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {contact.name}
              </motion.h2>
              <motion.p
                className="text-blue-100 text-lg opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.2, duration: 0.25 }}
              >
                New contact inquiry
              </motion.p>
            </div>
          </motion.div>

          {/* Contact Information Grid */}
          <div className="p-8">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" variants={containerVariants}>
              <AnimatePresence>
                {contactFields.map((field, index) => (
                  <motion.div
                    key={field.label}
                    className="group p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-150 cursor-pointer hover:shadow-lg"
                    variants={fieldVariants}
                    whileHover={{
                      y: -3,
                      transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div
                        className={`w-12 h-12 ${field.bg} rounded-xl flex items-center justify-center`}
                        variants={iconVariants}
                        whileHover="hover"
                      >
                        <field.icon className={`w-6 h-6 ${field.color}`} />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">{field.label}</p>
                        <p className="text-lg font-semibold text-slate-900 break-words">{field.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Message Section */}
            <motion.div
              className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-md transition-shadow duration-150"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-start space-x-4 mb-4">
                <motion.div
                  className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.1 }}
                >
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </motion.div>
                <div>
                  <motion.h3
                    className="text-xl font-bold text-slate-900 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Message
                  </motion.h3>
                  <div className="prose prose-slate max-w-none">
                    <motion.p
                      className="text-slate-700 leading-relaxed text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.65 }}
                    >
                      {contact.message}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.25 }}
            >
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-150"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Reply to Contact
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ContactDetails
