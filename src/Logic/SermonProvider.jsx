import PropTypes from "prop-types";
import { createContext, useState, useEffect } from "react";
import earlySermons from "../sermons/1964-1969/firstset.js";
import secondSet from "../sermons/1970/1970";
import thirdSet from "../sermons/1971/1971";
import fourthSet from "../sermons/1972/1972";
import lastSet from "../sermons/1973/1973";
import audioSermons from '../sermons/audio';

const SermonContext = createContext();

const sermonCollection = [
    ...earlySermons,
    ...secondSet,
    ...thirdSet,
    ...fourthSet,
    ...lastSet,
  ];

const SermonProvider = ({ children }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [allSermons, setAllSermons] = useState([]);
  const [recentSermons, setRecentSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [randomSermons, setRandomSermons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [CB , setCB] = useState(0);
  const [settings , setSettings] = useState({
    fontFamily:'cursive',
    fontStyle:'normal',
    fontSize:'20',
    fontWeight:'normal'
  })

  // Generate random sermon
  const getRandomSermon = () => {
    if (sermonCollection.length > 0) {
      const randomIndex = Math.floor(Math.random() * sermonCollection.length);
      return sermonCollection[randomIndex];
    }
    return null;
  };

  // Generate three random sermons
  const getThreeRandomSermons = () => {
    const sermons = new Set();
    while (sermons.size < 3 && sermons.size < sermonCollection.length) {
      const sermon = getRandomSermon();
      if (sermon) {
        sermons.add(sermon);
      }
    }
    return Array.from(sermons);
  };

  // get recently opened sermons
    useEffect(() => {
      const savedSettings = JSON.parse(localStorage.getItem('sermonSettings'));
     if(savedSettings){
      setSettings({
        fontFamily:savedSettings.fontFamily,
    fontStyle:savedSettings.fontStyle,
    fontSize:savedSettings.fontSize,
    fontWeight:savedSettings.fontWeight
      })
     }

        const recentSermons = JSON.parse(localStorage.getItem("recentSermons")) || [];
        setRecentSermons(recentSermons);
    }, []);

  useEffect(() => {
    const loadSermons = async () => {
        try {
          setLoading(true);
          
          const fetchedSermons = [
            ...earlySermons,
            ...secondSet,
            ...thirdSet,
            ...fourthSet,
            ...lastSet,
            ...audioSermons
          ];
      
          setAllSermons(fetchedSermons);
      
          // Wait until allSermons is set before getting random sermons
          const randomSermon = getRandomSermon();
          setSelectedMessage(randomSermon);
      
          const threeRandomSermons = getThreeRandomSermons();
          setRandomSermons(threeRandomSermons);
      
          setLoading(false);
          console.log("Sermons loaded:", fetchedSermons.length);
          console.log("Three random sermons:", threeRandomSermons);
      
        } catch (err) {
          console.error("Error loading sermons:", err);
          setError('Failed to load sermons. Please try again later.');
          setLoading(false);
        }
      };

    loadSermons(); // Call the function to load sermons on component mount
  }, []);

 

  const contextValue = {
    selectedMessage,
    allSermons,
    loading,
    error,
    recentSermons,
    setRecentSermons,
    setSelectedMessage,
    setActiveTab,
    activeTab,
    randomSermons,
    setRandomSermons,
    getThreeRandomSermons,
    setSearchQuery,
    searchQuery,
    settings,
    setSettings,
    CB,
    setCB,
  };

  console.log("SermonProvider rendering, context value:", contextValue);

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
      {error && <div className="error">{error}</div>}
    </SermonContext.Provider>
  );
};

SermonProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SermonContext, SermonProvider };