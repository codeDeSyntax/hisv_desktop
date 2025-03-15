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

const QuotesManager = () => {
  const [quotes, setQuotes] = useState<
    { id: number; title: string; year: string; content: string }[]
  >([]);
  const { settings } = useSermonContext();
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
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        You do not have a favorite Qoute saved
      </h2>
      <p className="text-background mb-6 max-w-md">
        Start saving favorites by adding your first quote. Click the + button to
        begin your collection.
      </p>
      <button
        onClick={() => {
          setSelectedQuote(null);
          setFormData({ title: "", year: "", content: "" });
          setCurrentView("form");
        }}
        className="bg-background text-primary px-6 py-3 rounded-full hover:bg-background/40 transition-colors flex items-center gap-2"
      >
        <PlusCircle size={24} />
        Add First Quote
      </button>
    </div>
  );

  const renderListView = () => (
    <div
      className="relative  bg-[rgb(250,238,209)] h-screen mx-auto px-4 pt-10 "
      style={{
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundImage: `linear-gradient(to bottom,
               rgba(154, 103, 74, 0) 0%,
          rgba(154, 103, 74, 5) 20%),
                url("./wood7.png")`,
      }}
    >
      {quotes.length === 0 ? (
        <EmptyState />
      ) : (
        <table className="w-full text-left">
          <thead className="bg-primary bg-opacity-50">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr
                key={quote.id}
                className=" hover:bg-background/20 hover:cursor-pointer hover:bg-opacity-30 transition-colors shadow"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src="./cloud.png"
                      alt=""
                      className="h-10 w-10 mr-4 rounded-full shadow-md bg-primary p-3"
                    />
                    <span className="text-sm font-semibold text-white truncate">
                      {quote.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {quote.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(quote)}
                      className="p-2 bg-background/30 hover:bg-background/50 rounded-lg transition-colors"
                    >
                      <Edit2 size={20} className="text-background" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuote(quote);
                        setCurrentView("view");
                      }}
                      className="p-2 bg-background/30 hover:bg-background/50 rounded-lg transition-colors"
                    >
                      <Eye size={20} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="p-2 bg-background/30 hover:bg-background/50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} className="text-background" />
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
        className="fixed bottom-6 right-6 h-16 flex items-center justify-center w-16  bg-background p-4 rounded-full shadow-2xl hover:bg-background/60 transition-colors z-50"
      >
        <PlusCircle size={24} className="text-primary" />
      </button>
    </div>
  );

  const renderFormView = () => (
    <div className=" mx-auto bg-primary h-full px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-[80%] mx-auto  rounded-xl p-8  border border-[#2a2a2a]"
      >
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="mr-4 text-gray-400 bg-background hover:text-white transition-colors"
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
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-background/30 border-none shadow border-background w-72 outline-none text-white rounded-lg px-4 py-3 w focus:outline-none focus:ring-2 focus:ring-orange-900 placeholder:text-gray-200"
              required
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              className="bg-background/40 border-none  text-white rounded-lg px-4 py-3 w-72 focus:outline-none focus:ring-2 focus:ring-orange-900 placeholder:text-gray-200"
              // required
            />
          </div>
          <textarea
            placeholder="Quote Content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="bg-background/30 text-white rounded-lg px-4 py-3 w-full h-48 focus:outline-none focus:ring-2 focus:ring-orange-900 placeholder:text-gray-200"
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-background   text-primary rounded-lg  transition-colors"
            >
              <Save size={20} className="mr-2" />
              {selectedQuote ? "Update Quote" : "Save Quote"}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("list")}
              className="px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderViewQuote = () => (
    <div className=" mx-auto px-4 py-3">
      <div className=" mx-auto  rounded-xl p-3 ">
        <div className="flex items-center mb-2">
          <div
            onClick={() => setCurrentView("list")}
            className="mr-4 text-primary hover:text-white transition-colors"
          >
            <ArrowLeftCircleIcon size={24} />
          </div>
          <h2 className="text-xl font-bold text-primary">Quote Details</h2>
        </div>
        <div className="space-y-4 overflow-y-scroll h-[85vh] no-scrollbar">
          <h3 className="text-xl font-bold text-stone-400 mb-2">
            {selectedQuote?.title}
          </h3>
          <p className="text-gray-400 text-lg mb-6">{selectedQuote?.year}</p>
          <div className=" rounded-lg p-6  ">
            <p
              className="text-stone-500 text-xl leading-relaxed whitespace-pre-wrap"
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
    <div className="h-screen bg-background bg-cover overflow-hidden  relative text-white font-serif ">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-secondary via-secondary to-primary bg-opacity-50"></div> */}
      {currentView === "list" && renderListView()}
      {currentView === "form" && renderFormView()}
      {currentView === "view" && renderViewQuote()}
    </div>
  );
};

export default QuotesManager;
