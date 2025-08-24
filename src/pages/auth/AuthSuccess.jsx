import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { fetchLoginUser } from "../../services/users";
import { CheckCircle, Heart, Sparkles, User, Home, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuthSuccess() {
  const navigate = useNavigate();
  const { refreshAuth } = useContext(AuthContext);
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const query = new URLSearchParams(window.location.search);
      const accessToken = query.get("accessToken");

      if (!accessToken) {
        setStatus("error");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        localStorage.setItem("accessToken", accessToken);
        const fullUser = await fetchLoginUser();
        localStorage.setItem("user", JSON.stringify(fullUser));

        setUser(fullUser);
        setProgress(100);
        clearInterval(progressInterval);

        await refreshAuth();
        setStatus("success");

        // Redirect after showing success
        setTimeout(() => {
          navigate("/");
        }, 2500);
      } catch (error) {
        console.error("Failed to fetch user after Google login:", error);
        setStatus("error");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleGoogleLogin();
  }, [navigate, refreshAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-3xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          💍
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 text-3xl"
          animate={{
            y: [0, -25, 0],
            rotate: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          💐
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 text-3xl"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 12, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          🎂
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-3xl"
          animate={{
            y: [0, -18, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          🥂
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-10 text-2xl"
          animate={{
            y: [0, -12, 0],
            x: [0, 10, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-10 text-2xl"
          animate={{
            y: [0, -10, 0],
            x: [0, -8, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2.5,
          }}
        >
          💕
        </motion.div>
      </div>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-3/4 w-20 h-20 bg-gradient-to-r from-purple-300/20 to-blue-300/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen px-4">
        <motion.div
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-12 w-full max-w-lg border border-white/20 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-30 blur-lg"></div>

          <AnimatePresence mode="wait">
            {status === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Loading Animation */}
                <motion.div
                  className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </motion.div>

                {/* Header */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Welcome Back!
                  </h1>
                  <p className="text-gray-600 text-lg">We're setting up your wedding planning account...</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {progress < 30 && "Authenticating your account..."}
                    {progress >= 30 && progress < 60 && "Fetching your profile..."}
                    {progress >= 60 && progress < 90 && "Setting up your dashboard..."}
                    {progress >= 90 && "Almost ready!"}
                  </p>
                </div>

                {/* Loading Steps */}
                <div className="space-y-3 text-left">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: progress > 20 ? 1 : 0.3, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        progress > 20 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300 animate-pulse"
                      }`}
                    >
                      {progress > 20 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm ${progress > 20 ? "text-gray-700" : "text-gray-400"}`}>
                      Google authentication verified
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: progress > 60 ? 1 : 0.3, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        progress > 60 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300 animate-pulse"
                      }`}
                    >
                      {progress > 60 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm ${progress > 60 ? "text-gray-700" : "text-gray-400"}`}>
                      Profile information loaded
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: progress > 90 ? 1 : 0.3, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        progress > 90 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300 animate-pulse"
                      }`}
                    >
                      {progress > 90 ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm ${progress > 90 ? "text-gray-700" : "text-gray-400"}`}>
                      Dashboard ready
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Success Animation */}
                <motion.div
                  className="w-28 h-28 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="w-14 h-14 text-white" />
                  </motion.div>
                </motion.div>

                {/* Success Message */}
                <div>
                  <motion.h1
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
                  </motion.h1>
                  <motion.p
                    className="text-gray-600 text-lg leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  >
                    You've successfully signed in with Google. Let's start planning your perfect wedding!
                  </motion.p>
                </div>

                {/* User Info Card */}
                {user && (
                  <motion.div
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Redirect Message */}
                <motion.div
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-medium">Redirecting to your dashboard...</span>
                  </div>
                </motion.div>

                {/* Manual Continue Button */}
                <motion.button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue to Dashboard</span>
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Error Animation */}
                <motion.div
                  className="w-24 h-24 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  >
                    <span className="text-4xl">⚠️</span>
                  </motion.div>
                </motion.div>

                {/* Error Message */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Authentication Failed</h1>
                  <p className="text-gray-600 text-lg">
                    We encountered an issue while signing you in. Please try again.
                  </p>
                </div>

                {/* Redirect Message */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Redirecting to login...</strong> You'll be redirected to the login page shortly.
                  </p>
                </div>

                {/* Manual Continue Button */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Return to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <p className="text-gray-400 text-xs flex items-center justify-center">
              <Heart className="w-3 h-3 mr-1" />
              Secure authentication for your wedding planning journey
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthSuccess;
