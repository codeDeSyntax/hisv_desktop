import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Modal } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Masonry from 'react-masonry-css';

const images = [
  "./gal/gal1.jpg",
  "./gal/gal2.jpg",
  "./gal/vog.jpeg",
  "./gal/gal3.jpg",
  // /./ "/gal/gal4.jpg",
  "./gal/gal5.jpg",
  "./gal/gal6.jpg",
  "./gal/gal7.jpg",
  "./gal/gal8.jpg",
  "./gal/gal9.webp",
  "./gal/gal10.jpg",
  "./cloud.png",
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const updateModalDimensions = () => {
      const width = window.innerWidth * 0.8;
      const height = window.innerHeight * 0.8;
      setModalDimensions({ width, height });
    };

    updateModalDimensions();
    window.addEventListener('resize', updateModalDimensions);

    return () => {
      window.removeEventListener('resize', updateModalDimensions);
    };
  }, []);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="p-8 bg-primary">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto"
        columnClassName="bg-clip-padding px-2"
      >
        {images.map((src, index) => (
          <motion.div
            key={src}
            className="mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentIndex(index);
              setIsModalOpen(true);
            }}
          >
            <Image
              src={src}
              alt={`Gallery image ${index + 1}`}
              className="w-full rounded-lg cursor-pointer"
              preview={false}
            />
          </motion.div>
        ))}
      </Masonry>

      <Modal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={modalDimensions.width}
        bodyStyle={{ height: modalDimensions.height, overflow: 'hidden', backgroundColor:'#202020' }}
        centered
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          <motion.button
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevImage}
          >
            <LeftOutlined className="text-2xl" />
          </motion.button>
          <motion.button
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextImage}
          >
            <RightOutlined className="text-2xl" />
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default Gallery;