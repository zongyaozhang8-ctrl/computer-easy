export interface TutorialStep {
  num: number;
  text: string;
  icon?: string;
  image?: string; // Optional illustration URL or SVG placeholder description
}

export interface Tutorial {
  id: string;
  title: string;
  category: "Windows" | "Word" | "Excel" | "浏览器" | "打印机" | "电脑基础";
  description: string;
  duration: string; // e.g., "1分钟", "2分钟"
  steps: TutorialStep[];
  searchKeywords: string[];
  isHot?: boolean;
  videoUrl?: string;
  practiceType?: "mouse_click" | "mouse_double_click" | "desktop_drag" | "word_open" | "word_type" | "word_save" | "excel_input" | "excel_merge" | "browser_search" | "printer_print";
}

export interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  steps?: { num: number; text: string; icon?: string }[];
  detectedApp?: string;
}

export interface HelpRequest {
  id: string;
  timestamp: string;
  problem: string;
  screenshot: string; // base64
  status: "pending" | "resolved";
  response?: string;
  responseAt?: string;
}

export interface Streak {
  count: number;
  lastStudyDate: string;
}

export interface LearningHistoryItem {
  id: string;
  date: string;
  title: string;
  category: string;
}

export interface DBState {
  favorites: string[];
  helpRequests: HelpRequest[];
  streak: Streak;
  learningHistory: LearningHistoryItem[];
}
