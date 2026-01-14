export interface Presence {
  userId: string;
  name: string;
  color: string;
  online: boolean;
}

export interface CursorPosition {
  userId: string;
  file: string;
  line: number;
  column: number;
}

export interface FileUpdate {
  file: string;
  content: string;
  version: number;
}
