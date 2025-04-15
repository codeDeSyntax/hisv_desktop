// components/PresentationDetail.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  User, 
  FileText, 
  MessageSquare, 
  Quote, 
  Pencil, 
  Trash2, 
  Presentation as PresentationIcon
} from 'lucide-react';
import { useEvPresentationContext } from '@/Provider/EvPresent';
import { Presentation as PresentationType } from '@/types';

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start mb-6">
      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className="mt-1 text-lg">{value}</div>
      </div>
    </div>
  );
};

export const PresentationDetail: React.FC<{ 
  presentation: PresentationType;
  onBack: () => void;
  onEdit: () => void;
}> = ({ presentation, onBack, onEdit }) => {
  const { deletePresentation, setCurrentPresentation, startPresentation } = useEvPresentationContext();
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this presentation?')) {
      await deletePresentation(presentation.id);
      onBack();
    }
  };
  
  const handlePresent = () => {
    setCurrentPresentation(presentation);
    startPresentation();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">{presentation.title}</h1>
        
        {presentation.type === 'sermon' ? (
          <>
            <DetailItem 
              icon={<User size={20} />} 
              label="Preacher" 
              value={(presentation as any).preacher} 
            />
            
            <DetailItem 
              icon={<Calendar size={20} />} 
              label="Date" 
              value={new Date((presentation as any).date).toLocaleDateString()} 
            />
            
            <DetailItem 
              icon={<BookOpen size={20} />} 
              label="Scriptures" 
              value={(
                <div className="space-y-2">
                  {(presentation as any).scriptures.map((scripture: any, index: number) => (
                    // components/PresentationDetail.tsx (continued)
                    <div key={index} className="px-3 py-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      {scripture.text}
                    </div>
                  ))}
                </div>
              )} 
            />
            
            {(presentation as any).mainMessage && (
              <DetailItem 
                icon={<MessageSquare size={20} />} 
                label="Main Message" 
                value={(presentation as any).mainMessage} 
              />
            )}
            
            {(presentation as any).quote && (
              <DetailItem 
                icon={<Quote size={20} />} 
                label="Quote" 
                value={(presentation as any).quote} 
              />
            )}
          </>
        ) : (
          <DetailItem 
            icon={<FileText size={20} />} 
            label="Message" 
            value={(presentation as any).message} 
          />
        )}
      </div>
      
      <div className="flex space-x-4 mt-auto">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEdit}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg"
        >
          <Pencil size={20} className="mr-2" />
          <span>Edit</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePresent}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg"
        >
          <PresentationIcon size={20} className="mr-2" />
          <span>Present</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDelete}
          className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg"
        >
          <Trash2 size={20} />
        </motion.button>
      </div>
    </div>
  );
};