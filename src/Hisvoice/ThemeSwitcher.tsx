import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
      document.documentElement.classList.toggle('dark', savedMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return (
    <button onClick={toggleDarkMode} className="p-2 rounded-full ">
      {isDarkMode ? (
        <SunOutlined className="h-6 w-6 text-gray-400" />
      ) : (
        <MoonOutlined className="h-6 w-6 text-gray-400" />
      )}
    </button>
  );
};

export default DarkModeToggle;
