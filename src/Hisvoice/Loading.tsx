import { Spin } from "antd"; // You may need to install Ant Design for the spinner

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-primary ">
      <div className="text-center">
        <Spin size="large" className="text-white"/>
        <h2 className="text-white text-lg mt-4">Loading...</h2>
        <p className="text-gray-400">Please wait while we load your content</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
