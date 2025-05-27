import { Spin } from "antd"; // You may need to install Ant Design for the spinner

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f4f3f3f] dark:bg-background ">
      <div className="text-center">
        <Spin size="large" className="text-stone-500 dark:text-orange-900 animate-spin"/>
        <h2 className="text-stone-500 dark:text-gray-50 text-lg mt-4">Loading...</h2>
        <p className="text-stone-500 dark:text-gray-50">Please wait while we load your content</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
