import { useEffect, useRef } from "react";

const AutoScrollBox = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }, [children]); // Scrolls when content updates

  return (
    <div
      ref={containerRef}
      className="h-28 overflow-y-auto no-scrollbar rounded-md"
    >
      {children}
    </div>
  );
};
export default AutoScrollBox;
