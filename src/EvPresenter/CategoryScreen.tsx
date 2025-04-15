// components/CategorySelection.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Film } from 'lucide-react';
import { useEvPresentationContext } from '@/Provider/EvPresent';
import { Presentation } from '@/types';

type CategoryCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ title, count, icon, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900 rounded-xl shadow-md cursor-pointer"
    >
      <div className="bg-blue-500 text-white p-4 rounded-full mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-800 rounded-full">
        <span className="text-sm font-medium">{count}</span>
      </div>
    </motion.div>
  );
};

export const CategorySelection: React.FC<{ onCategorySelect: (type: 'sermon' | 'other') => void }> = ({ onCategorySelect }) => {
  const { presentations } = useEvPresentationContext();
  
  const sermonCount = presentations.filter(p => p.type === 'sermon').length;
  const otherCount = presentations.filter(p => p.type === 'other').length;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold mb-10">Presentation Master</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <CategoryCard
          title="Sermons"
          count={sermonCount}
          icon={<BookOpen size={32} />}
          onClick={() => onCategorySelect('sermon')}
        />
        <CategoryCard
          title="Other"
          count={otherCount}
          icon={<Film size={32} />}
          onClick={() => onCategorySelect('other')}
        />
      </div>
    </div>
  );
};