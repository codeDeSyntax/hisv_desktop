import React, { useState } from "react";
import {
  Plus,
  Settings,
  Heart,
  BookOpen,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";

// Types
interface FloatingButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon = <Plus size={24} />,
  onClick,
  position = "bottom-right",
  size = "md",
  variant = "primary",
  className = "",
  disabled = false,
  tooltip,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const {prevScreen,setActiveTab} = useSermonContext()
  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25",
    secondary:
      "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-gray-500/25",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25",
    warning:
      "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/25",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25",
  };

  const handleClick = () => {
   setActiveTab(localStorage.getItem("prevScreen") || "home")
  };

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
        className={`
          fixed z-50 rounded-full text-white font-medium
          transition-all duration-300 ease-out
          transform hover:scale-110 active:scale-95
          shadow-lg hover:shadow-2xl
          backdrop-blur-sm border border-white/20
          ${positionClasses[position]}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isPressed ? "scale-95" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        style={{
          filter: disabled ? "grayscale(100%)" : "none",
        }}
      >
        <div
          className={`flex items-center justify-center w-full h-full transition-transform duration-200 ${
            isPressed ? "rotate-180" : ""
          }`}
        >
          {icon}
        </div>

        {/* Ripple effect */}
        <div
          className="absolute inset-0 rounded-full bg-white/20 opacity-0 animate-ping pointer-events-none"
          style={{ animationDuration: isPressed ? "0.6s" : "0s" }}
        />
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && !disabled && (
        <div
          className={`
          fixed z-40 px-3 py-2 text-sm font-medium text-white
          bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg
          pointer-events-none transition-all duration-200
          ${position.includes("right") ? "right-20" : "left-20"}
          ${position.includes("bottom") ? "bottom-8" : "top-8"}
        `}
        >
          {tooltip}
          <div
            className={`
            absolute w-2 h-2 bg-gray-900/90 rotate-45
            ${position.includes("right") ? "-right-1" : "-left-1"}
            ${position.includes("bottom") ? "bottom-3" : "top-3"}
          `}
          />
        </div>
      )}
    </>
  );
};

export default FloatingButton;
