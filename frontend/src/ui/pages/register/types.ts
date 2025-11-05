export interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  major: string;
  grade: string;
  dietaryRestriction: string;
  dietaryOther: string;
  profilePicture: File | null;
  github: string;
  linkedin: string;
  discord: string;
  instagram: string;
  resume: File | null;
}

export type ChatStage = 
  | 'chat-name' 
  | 'chat-confirm' 
  | 'chat-lastname' 
  | 'chat-email' 
  | 'chat-email-confirm' 
  | 'form';

export interface ParsedName {
  firstName: string;
  lastName: string;
}

