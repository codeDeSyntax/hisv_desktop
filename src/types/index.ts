

export interface Sermon {
  id: number | string;
  title: string;
  date?: string;
  year?: string;
  sermon?: string;
  type?: string;
  audioUrl?: string;
  downloadLink?:string;
  location?:string;
  lastRead?: string;
}

