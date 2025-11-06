import { motion } from 'framer-motion';
import { Sprout, TreeDeciduous, Flower } from 'lucide-react';

function EcoTwinAvatar({ ecoScore = 50, size = 'large' }) {
  // Determine avatar stage based on score
  const getAvatarStage = (score) => {
    if (score <= 30) return { icon: Sprout, color: 'text-red-500', label: 'Wilted Plant', bg: 'bg-red-100 dark:bg-red-900' };
    if (score <= 70) return { icon: TreeDeciduous, color: 'text-yellow-500', label: 'Growing Plant', bg: 'bg-yellow-100 dark:bg-yellow-900' };
    return { icon: Flower, color: 'text-eco-green-500', label: 'Blooming Tree', bg: 'bg-eco-green-100 dark:bg-eco-green-900' };
  };

  const stage = getAvatarStage(ecoScore);
  const Icon = stage.icon;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`${sizeClasses[size]} ${stage.bg} rounded-full flex items-center justify-center shadow-lg relative overflow-hidden`}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Animated background particles */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className={`${iconSizes[size]} ${stage.color} relative z-10`} />
        </motion.div>
      </motion.div>
      
      <motion.p
        className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {stage.label}
      </motion.p>
      
      <motion.div
        className="mt-2 text-2xl font-bold bg-gradient-to-r from-eco-green-600 to-eco-blue-600 bg-clip-text text-transparent"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {ecoScore}/100
      </motion.div>
    </div>
  );
}

export default EcoTwinAvatar;
