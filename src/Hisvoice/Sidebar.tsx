/* eslint-disable react/prop-types */
import {
  Menu,
  X,
  Home,
  Book,
  Settings,
  Clock,
  BookOpen,
  Info,
  PlusCircle,
} from "lucide-react";
import { useContext } from "react";
import { PlayCircleFilled } from "@ant-design/icons";
import { useSermonContext } from "@/Provider/Vsermons";

interface SideNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const SideNav = ({ isCollapsed, setIsCollapsed }: SideNavProps) => {
  const { activeTab, setActiveTab, CB } = useSermonContext();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const mainItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Book, label: "Sermons", id: "sermons" },
    { icon: BookOpen, label: "Message", id: "message" },
    { icon: Clock, label: "Recents", id: "recents" },
    // { icon: PlayCircleFilled, label: "Media", id: "media" },
    // { icon: Plus, label: "Media", id: "add qoute" },
  ];

  const bottomItems = [
    { icon: Settings, label: "Settings", id: "settings" },
    // { icon: Info, label: "About", id: "about" },
  ];

  interface NavItemProps {
    item: {
      icon: React.ElementType;
      label: string;
      id: string;
    };
  }

  const NavItem = ({ item }: NavItemProps) => (
    <button
      key={item.id}
      className={`flex items-center justify-center hover:bg-gray-100 dark:hover:bg-ltgray/30 w-fu p-2 focus:outline-none ${
        activeTab === item.id
          ? " bg-gray-200 dark:bg-bgray  shadow   "
          : "bg-white shadow dark:bg-ltgray text-stone-500 dark:text-gray-50"
      }`}
      onClick={() => setActiveTab(item.id)}
    >
      <item.icon
        size={14}
        className={`text-[#9a674a]
          ${
            activeTab === item.id
              ? "text-stone-500 dark:text-gray-50"
              : "text-stone-500 dark:text-gray-50"
          }
        ${activeTab === "message" && "text-text"}
        }
         
        `}
      />

      {!isCollapsed && <span className="ml-4">{item.label}</span>}
    </button>
  );

  return (
    <div
      className={` top-0 left-0 w-[5%]   h-full bg-white shadow   dark:bg-ltgray text-white transition-all duration-300    z10`}
    >
      <nav className="h-full  flex flex-col  py-10 bg-gray-50  dark:bg-ltgray ">
        <div className="flex flex-col gap-2 p-2 ">
          {/* <div className="flex flex-col gap-2  items-center justify-center p-2">
            <button onClick={toggleSidebar} className="bg-white text-#693434">
              {isCollapsed ? <Menu size={14} /> : <X size={14} />}
            </button>
          </div> */}
          {mainItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
          <button
            onClick={() => setActiveTab("quotes")}
            className={` bg-gray-50 hover:bg-gray-100 dark:hover:bg-ltgray/30 dark:bg-ltgray flex items-center w-full p-2  text-sm font-semibold focus:outline-none transition-colors duration-300 justify-center dark:text-gray-50 text-stone-500`}
          >
            <PlusCircle size={15} />
          </button>
        </div>
        <div className="mt-auto mb-14 flex flex-col gap-2 p-2">
          {bottomItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SideNav;
