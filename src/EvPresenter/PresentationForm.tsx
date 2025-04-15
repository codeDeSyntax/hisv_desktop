// components/PresentationForm.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { useEvPresentationContext } from '@/Provider/EvPresent';
import { Presentation, Scripture } from '@/types';

interface SermonFormProps {
  initialData?: Partial<Presentation>;
  onSave: () => void;
  onCancel: () => void;
}

export const SermonForm: React.FC<SermonFormProps> = ({ initialData, onSave, onCancel }) => {
  const { createPresentation, updatePresentation ,selectedPath} = useEvPresentationContext();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [preacher, setPreacher] = useState((initialData as any)?.preacher || '');
  const [date, setDate] = useState((initialData as any)?.date || new Date().toISOString().split('T')[0]);
  const [scriptures, setScriptures] = useState<Scripture[]>((initialData as any)?.scriptures || []);
  const [mainMessage, setMainMessage] = useState((initialData as any)?.mainMessage || '');
  const [quote, setQuote] = useState((initialData as any)?.quote || '');
  
  const [newScripture, setNewScripture] = useState('');
  
  const addScripture = () => {
    if (newScripture.trim()) {
      setScriptures([...scriptures, { text: newScripture.trim() }]);
      setNewScripture('');
    }
  };
  
  const removeScripture = (index: number) => {
    const updatedScriptures = [...scriptures];
    updatedScriptures.splice(index, 1);
    setScriptures(updatedScriptures);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sermonData = {
      type: 'sermon' as const,
      title,
      preacher,
      date,
      scriptures,
      mainMessage: mainMessage || undefined,
      quote: quote || undefined
    };
    
    if (initialData?.id) {
      await updatePresentation(initialData.id,selectedPath, sermonData);
    } else {
      await createPresentation(selectedPath,sermonData);
    }
    
    onSave();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Preacher</label>
        <input
          type="text"
          value={preacher}
          onChange={(e) => setPreacher(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Scriptures</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newScripture}
            onChange={(e) => setNewScripture(e.target.value)}
            placeholder="Add scripture..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={addScripture}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="mt-2 space-y-2">
          {scriptures.map((scripture, index) => (
            <div key={index} className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <span>{scripture.text}</span>
              <button
                type="button"
                onClick={() => removeScripture(index)}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Main Message (Optional)</label>
        <textarea
          value={mainMessage}
          onChange={(e) => setMainMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Quote (Optional)</label>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div className="flex space-x-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg"
        >
          <Save size={20} className="mr-2" />
          <span>Save</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
};

export const OtherForm: React.FC<SermonFormProps> = ({ initialData, onSave, onCancel }) => {
  const { createPresentation, updatePresentation ,selectedPath} = useEvPresentationContext();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [message, setMessage] = useState((initialData as any)?.message || '');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otherData = {
      type: 'other' as const,
      title,
      message
    };
    
    if (initialData?.id) {
      await updatePresentation(initialData.id,selectedPath, otherData);
    } else {
      await createPresentation(selectedPath,otherData);
    }
    
    onSave();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      
      <div className="flex space-x-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg"
        >
          <Save size={20} className="mr-2" />
          <span>Save</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
};