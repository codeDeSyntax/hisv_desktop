// types/index.ts

export type Scripture = {
    text: string;
  };
  
  export type SermonPresentation = {
    id: string;
    type: 'sermon';
    title: string;
    scriptures: Scripture[];
    mainMessage?: string;
    preacher: string;
    quote?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type OtherPresentation = {
    id: string;
    type: 'other';
    title: string;
    message: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type Presentation = SermonPresentation | OtherPresentation;