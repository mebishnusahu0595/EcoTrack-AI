import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Upload, Send, CheckCircle, Camera, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import localStorageService from '../services/localStorage';

function ReportIssue() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: null
  });
  const [useAutoLocation, setUseAutoLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { currentUser } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const getAutoLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ 
            ...prev, 
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          }));
          setUseAutoLocation(true);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setFormData(prev => ({ 
            ...prev, 
            location: 'Location unavailable' 
          }));
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    const reportData = {
      ...formData,
      status: 'pending',
      upvotes: 0,
      confirmations: 0,
      userId: currentUser?.uid || 'guest',
      imageUrl: imagePreview // In production, upload to Firebase Storage
    };

    await localStorageService.addDoc('reports', reportData);

    setLoading(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        location: '',
        description: '',
        image: null
      });
      setImagePreview(null);
      setUseAutoLocation(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Report Water Issue
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help your community by reporting water-related issues
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      disabled={useAutoLocation}
                      className="input-field flex-1"
                      placeholder="Enter location or use auto-detect"
                    />
                    <motion.button
                      type="button"
                      onClick={getAutoLocation}
                      disabled={loading || useAutoLocation}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary px-4 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <MapPin className="w-5 h-5" />
                      <span className="hidden sm:inline">Auto</span>
                    </motion.button>
                  </div>
                  {useAutoLocation && (
                    <p className="text-xs text-eco-green-600 mt-1">
                      ✓ Location detected automatically
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Issue Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="input-field resize-none"
                    placeholder="Describe the water issue in detail (e.g., leaking pipe, water wastage, contamination, etc.)"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Image (Optional)
                  </label>
                  
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-eco-blue-500 transition-colors bg-gray-50 dark:bg-gray-800">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG or WEBP (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Camera className="w-5 h-5" />
                      </motion.div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-eco-blue-50 dark:bg-eco-blue-900 rounded-lg"
              >
                <h3 className="font-semibold text-eco-blue-800 dark:text-eco-blue-200 mb-2">
                  📋 How it works:
                </h3>
                <ul className="text-sm text-eco-blue-700 dark:text-eco-blue-300 space-y-1">
                  <li>• Your report will be sent to Nagar Nigam (Municipal Corporation)</li>
                  <li>• Community members can confirm/upvote your report</li>
                  <li>• Reports with enough confirmations are prioritized</li>
                  <li>• You'll earn Green Credits when the issue is resolved!</li>
                </ul>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="card text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <CheckCircle className="w-20 h-20 text-eco-green-500 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-eco-green-600 mb-4">
                Report Submitted Successfully!
              </h2>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Thank you for helping your community! 🌍
              </p>
              
              <p className="text-gray-600 dark:text-gray-400">
                Your report has been forwarded to Nagar Nigam.
                <br />
                We'll take action soon!
              </p>

              <div className="mt-8 inline-flex items-center space-x-2 px-6 py-3 bg-eco-green-100 dark:bg-eco-green-900 rounded-full">
                <span className="text-2xl">🏆</span>
                <span className="font-semibold text-eco-green-700 dark:text-eco-green-300">
                  +10 Green Credits
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ReportIssue;
