export interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;             // interne Datenbank-ID
  globalId: string;       // eindeutige ID für Quiz/Antworten (z. B. category-id)
  questionText: string;
  type: 'sc' | 'mc' | 'fi';
  answers: Answer[];
  category: string;
  hint?: string;
}