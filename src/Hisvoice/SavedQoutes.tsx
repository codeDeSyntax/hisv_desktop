import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit2,
  Trash2,
  Save,
  Eye,
  BookOpen,
  ArrowLeft,
  ArrowLeftCircleIcon,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "../Provider/Theme";

const QuotesManager = () => {
  const [quotes, setQuotes] = useState<
    { id: number; title: string; year: string; content: string }[]
  >([]);
  const { settings, theme } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState("list");
  const [selectedQuote, setSelectedQuote] = useState<{
    id: number;
    title: string;
    year: string;
    content: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    year: "",
    content: "",
  });

  useEffect(() => {
    const storedQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    setQuotes(storedQuotes);
  }, []);

  const saveToLocalStorage = (updatedQuotes: any[]) => {
    localStorage.setItem("quotes", JSON.stringify(updatedQuotes));
    setQuotes(updatedQuotes);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedQuote) {
      const updatedQuotes = quotes.map((q) =>
        q.id === selectedQuote.id ? { ...formData, id: selectedQuote.id } : q
      );
      saveToLocalStorage(updatedQuotes);
    } else {
      const newQuote = {
        ...formData,
        id: Date.now(),
      };
      saveToLocalStorage([...quotes, newQuote]);
    }
    setFormData({ title: "", year: "", content: "" });
    setSelectedQuote(null);
    setCurrentView("list");
  };

  const handleDelete = (id: number) => {
    const updatedQuotes = quotes.filter((quote) => quote.id !== id);
    saveToLocalStorage(updatedQuotes);
    setSelectedQuote(null);
    setCurrentView("list");
  };

  const handleEdit = (quote: {
    id: number;
    title: string;
    year: string;
    content: string;
  }) => {
    setFormData(quote);
    setSelectedQuote(quote);
    setCurrentView("form");
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center p-6">
      <BookOpen size={80} className="text-primary mb-6 opacity-70" />
      <h2 className="text-2xl md:text-3xl font-bold text-stone-500 dark:text-white mb-4">
        You do not have a favorite Qoute saved
      </h2>
      <p className="text-primary mb-6 max-w-md">
        Start saving favorites by adding your first quote. Click the + button to
        begin your collection.
      </p>
      <button
        onClick={() => {
          setSelectedQuote(null);
          setFormData({ title: "", year: "", content: "" });
          setCurrentView("form");
        }}
        className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <PlusCircle size={24} />
        Add First Quote
      </button>
    </div>
  );

  const renderListView = () => (
    <div
      className="relative h-screen overfow-y-scroll no-scrollbar bg-white/30 dark:bg-ltgray mx-auto px-4 pt-10 "
      style={{
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundImage: !isDarkMode
          ? `linear-gradient(to bottom,
               rgba(255, 255, 255, 0%) 0%,
          rgba(255, 255, 255, 5) 20%),
                url("./snow2.jpg")`
          : `linear-gradient(to bottom,
               rgba(154, 103, 74, 0) 0%,
          rgba(0,0, 0, 5) 20%),
                url("./snow2.jpg")`,
      }}
    >
      {quotes.length === 0 ? (
        <EmptyState />
      ) : (
        <table className="w-full text-left">
          <thead className="bg-white dark:bg-bgray bg-opacity-70">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-stone-500 dark:text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-xs font-medium text-stone-500 dark:text-gray-700 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-4 text-xs font-medium text-stone-500 dark:text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr
                key={quote.id}
                className=" dark:hover:bg-ltgray/20 dark:shadow-bgray  hover:cursor-pointer hover:bg-opacity-30 transition-colors shadow py-0"
              >
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src="./icon.png"
                      alt=""
                      className="h-4 w-4 mr-4 rounded-full shadow-md dark:bg-ltgray p-2"
                    />
                    <span className="text-sm font-semibold text-stone-500 dark:text-gray-50 truncate">
                      {quote.title}
                    </span>
                  </div>
                </td>
                <td className=" text-[12px] whitespace-nowrap text-sm text-gray-400">
                  {quote.year}
                </td>
                <td className="whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(quote)}
                      className="p-2 dark:bg-ltgray bg-gray-100 hover:bg-ltgray/50 hover:scale-105 rounded-lg transition-colors"
                    >
                      <Edit2
                        size={14}
                        className="text-stone-500 dark:text-stone-500"
                      />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuote(quote);
                        setCurrentView("view");
                      }}
                      className="p-2 dark:bg-ltgray bg-gray-100 hover:bg-ltgray/50 hover:scale-105 rounded-lg transition-colors"
                    >
                      <Eye size={14} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="p-2 dark:bg-ltgray bg-gray-100 hover:bg-ltgray/50 hover:scale-105 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => {
          setSelectedQuote(null);
          setFormData({ title: "", year: "", content: "" });
          setCurrentView("form");
        }}
        className="fixed bottom-6 right-6 h-16 flex items-center justify-center w-16  bg-primary p-4 rounded-full shadow-2xl  text-white hover:bg-primary/90 transition-colors z-50"
      >
        <PlusCircle size={24} className="" />
      </button>
    </div>
  );

  const renderFormView = () => (
    <div className=" mx-auto bg-white dark:bg-ltgray h-full px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-[80%] mx-auto  rounded-xl p-8  border border-[#2a2a2a]"
      >
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="mr-4 text-gray-400 bg-gray-50 dark:bg-[#424242] focus:outline-none dark:hover:text-gray-100 hover:text-stone-600 transition-colors"
            >
              <ArrowLeft size={14} />
            </button>
            <h2 className="text-[12px] font-bold text-white">
              {selectedQuote ? "Edit Quote" : "Add New Quote"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-co2 gap-3 ">
            <input
              type="text"
              placeholder="Sermon Title"
              spellCheck={false}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-gray-50 dark:bg-bgray text-stone-500 dark:text-gray-50 border-none shadow border-background w-72 outline-none  rounded-lg px-4 py-3 w focus:outline-none f  placeholder:text-stone-500 dark:placeholder:text-gray-50 "
              required
            />
          </div>
          <textarea
            placeholder="Quote Content"
            value={formData.content}
            spellCheck={false}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="bg-gray-50 dark:bg-ltgray text-stone-500 dark:text-gray-50 rounded-lg px-4 py-3 w-full h-48 focus:outline-none f  placeholder:text-stone-500 dark:placeholder:text-gray-50 "
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-gray-500 dark:bg-[#424242] dark:text-white text-white rounded-lg  transition-colors text-[12px]"
            >
              <Save size={20} className="mr-2" />
              {selectedQuote ? "Update Quote" : "Save Quote"}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="px-6 py-3 bg-red-400  text-white dark:text-gray-50 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderViewQuote = () => (
    <div className=" mx-auto px-4 py-3 bg-white dark:bg-ltgray">
      <div className=" mx-auto  rounded-xl p-3 ">
        <div className="flex items-center mb-2">
          <div
            onClick={() => setCurrentView("list")}
            className="mr-4 text-primary hover:text-gray-400 transition-colors"
          >
            <ArrowLeftCircleIcon size={24} />
          </div>
          <h2 className="text-xl font-bold text-primary">Quote Details</h2>
        </div>
        <div className="space-y-4 overflow-y-scroll h-[85vh] no-scrollbar">
          <h3 className="text-xl font-bold text-stone-400 dark:text-gray-50 mb-2">
            {selectedQuote?.title}
          </h3>
          <p className="text-gray-400 text-lg mb-6">{selectedQuote?.year}</p>
          <div className=" rounded-lg p-6  ">
            <p
              className="text-stone-500 dark:text-gray-200 text-xl leading-relaxed whitespace-pre-wrap"
              style={{
                fontFamily: settings.fontFamily,
                fontWeight: settings.fontWeight,
                fontSize: `${settings.fontSize}px`,
                fontStyle: settings.fontStyle,
              }}
            >
              "{selectedQuote?.content}"
            </p>
          </div>
          {/* <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => handleEdit(selectedQuote)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit2 size={20} />
              Edit
            </button>
            <button
              onClick={() => handleDelete(selectedQuote.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={20} />
              Delete
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background dark:bg-ltgray bg-cover overflow-scroll no-scrollbar  relative text-white font-serif ">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary to-primary bg-opacity-50"></div> */}
      {currentView === "list" && renderListView()}
      {currentView === "form" && renderFormView()}
      {currentView === "view" && renderViewQuote()}
    </div>
  );
};

export default QuotesManager;
