export interface Option {
  label: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
}

export interface Question {
  id: string;
  number: number;
  questionText: string;
  options: Option[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation?: string;
}

export interface Lesson {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  iconEmoji: string;
  questions: Question[];
  rawText?: string;
  notes?: string; // Rich study notes & theory summary
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  iconEmoji: string;
  color: string; // e.g., 'amber', 'emerald', 'sky', 'purple', 'rose', 'indigo'
  description?: string;
  createdAt: number;
}

export interface QuizResult {
  id: string; // Unique attempt ID
  lessonId: string;
  lessonTitle: string;
  categoryId: string;
  categoryName: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  userAnswers: Record<string, string>; // questionId -> chosen option label
  timeSpentSeconds: number;
  completedAt: number;
}

export type ActiveView = 
  | { type: 'categories' }
  | { type: 'category_detail'; categoryId: string; initialTab?: 'questions' | 'notes' }
  | { type: 'notes_hub'; categoryId?: string }
  | { type: 'note_viewer'; lessonId: string; fromView?: 'categories' | 'category_detail' | 'notes_hub'; returnView?: ActiveView }
  | { type: 'quiz'; lessonId: string }
  | { type: 'quiz_analysis'; result: QuizResult; lessonId: string }
  | { type: 'history' }
  | { type: 'ai_tutor'; initialQuery?: string }
  | { type: 'admin'; initialTab?: 'upload' | 'categories' | 'lessons'; defaultCategoryId?: string };

