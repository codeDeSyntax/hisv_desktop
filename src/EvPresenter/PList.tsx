// components/PresentationList.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Film, Pencil, Trash2, Presentation, ChevronRight } from 'lucide-react';
import { useEvPresentationContext } from '@/Provider/EvPresent';
import { Presentation as PresentationType } from '@/types';

type PresentationCardProps = {
  presentation: PresentationType;
  onSelect: (presentation: PresentationType) => void;
  onEdit: (presentation: PresentationType) => void;
  onDelete: (id: string) => void;
  onPresent: (presentation: PresentationType) => void;
};

const PresentationCard: React.FC<PresentationCardProps> = ({ 
  presentation, 
  onSelect, 
  onEdit, 
  onDelete,
  onPresent
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <div 
        onClick={() => onSelect(presentation)}
        className="flex items-center p-4 cursor-pointer"
      >
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
          {presentation.type === 'sermon' ? <BookOpen size={20} /> : <Film size={20} />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{presentation.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date(presentation.updatedAt).toLocaleDateString()} • 
            {presentation.type === 'sermon' ? ` ${(presentation as any).preacher}` : ' Other'}
          </p>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
      
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => onEdit(presentation)} 
          className="flex-1 flex items-center justify-center p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
        >
          <Pencil size={16} className="mr-1" />
          <span>Edit</span>
        </button>
        <button 
          onClick={() => onPresent(presentation)} 
          className="flex-1 flex items-center justify-center p-3 text-green-500 hover:bg-green-50 dark:hover:bg-green-900"
        >
          <Presentation size={16} className="mr-1" />
          <span>Present</span>
        </button>
        <button 
          onClick={() => onDelete(presentation.id)} 
          className="flex-1 flex items-center justify-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
        >
          <Trash2 size={16} className="mr-1" />
          <span>Delete</span>
        </button>
      </div>
    </motion.div>
  );
};

export const PresentationList: React.FC<{ 
  type: 'sermon' | 'other';
  onBack: () => void;
  onSelect: (presentation: PresentationType) => void;
  onEdit: (presentation: PresentationType) => void;
  onNew: () => void;
}> = ({ type, onBack, onSelect, onEdit, onNew }) => {
  const { presentations, deletePresentation, setCurrentPresentation, startPresentation } = useEvPresentationContext();
  
  const filteredPresentations = presentations.filter(p => p.type === type);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this presentation?')) {
      await deletePresentation(id);
    }
  };
  
  const handlePresent = (presentation: PresentationType) => {
    setCurrentPresentation(presentation);
    startPresentation();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{type === 'sermon' ? 'Sermons' : 'Other Presentations'}</h1>
        <button
          onClick={onNew}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          New {type === 'sermon' ? 'Sermon' : 'Presentation'}
        </button>
      </div>
      
      {filteredPresentations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No presentations found</p>
          <button
            onClick={onNew}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create your first {type === 'sermon' ? 'sermon' : 'presentation'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresentations.map(presentation => (
            <PresentationCard
              key={presentation.id}
              presentation={presentation}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={handleDelete}
              onPresent={handlePresent}
            />
          ))}
        </div>
      )}
    </div>
  );
};