
export interface Song {
    title: string;
    path: string;
    content: string;
    message?: string;
    dateModified: string;
  }

  export interface EditSong {
    currentScreen: string;
    setCurrentScreen: (screen: string) => void;
    setEditContent: (content: string) => void;
    setEditTitle: (title: string) => void;
    editContent: string;
    editTitle: string;
    selectedSong: Song | null;
    setSelectedSong: (song: Song | null) => void;
  }