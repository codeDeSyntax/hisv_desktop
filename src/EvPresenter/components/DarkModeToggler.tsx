// // components/ThemeToggle.tsx

// import React from 'react';
// import { motion } from 'framer-motion';
// import { Sun, Moon } from 'lucide-react';
// import { useTheme } from '@/contexts/ThemeContext';

// export const ThemeToggle: React.FC = () => {
//   const { isDarkMode, toggleDarkMode } = useTheme();

//   return (
//     <motion.button
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={toggleDarkMode}
//       className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
//       aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
//     >
//       {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
//     </motion.button>
//   );
// };