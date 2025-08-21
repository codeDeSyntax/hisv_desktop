import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/Provider/Theme';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

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
