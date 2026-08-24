import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Question } from '../question';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent {
  questions: Question[] = [];
  userAnswers: { [qid: string]: any[] } = {}; // Key = globalId
  mode: 'learn' | 'exam' = 'exam';
  score = 0;
  openIndex: number | null = null;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as {
      questions: Question[];
      userAnswers: { [qid: string]: any[] };
      mode: 'learn' | 'exam';
    };

    if (state) {
      this.questions = state.questions || [];
      this.userAnswers = state.userAnswers || {};
      this.mode = state.mode || 'exam';
      this.calculateScore();
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleAccordion(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  calculateScore() {
    let correctCount = 0;
    this.questions.forEach(q => {
      const key = q.globalId; // 🔑 statt eigener Funktion
      if (q.type === 'fi') {
        const given = (this.userAnswers[key]?.[0] || '').toLowerCase().trim();
        const correctAnswers = q.answers
          .filter(a => a.isCorrect)
          .map(a => a.answerText.toLowerCase().trim());
        if (correctAnswers.includes(given)) {
          correctCount++;
        }
      } else {
        const selected = this.userAnswers[key] || [];
        const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
        if (this.arraysEqual([...selected].sort(), [...correctIds].sort())) {
          correctCount++;
        }
      }
    });
    this.score = correctCount;
  }

  private arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  isFillInCorrect(q: Question, givenAnswer: string): boolean {
    const correctAnswers = q.answers
      .filter(a => a.isCorrect)
      .map(a => a.answerText.toLowerCase().trim());
    return correctAnswers.includes((givenAnswer || '').toLowerCase().trim());
  }

  getCorrectAnswers(q: Question): string {
    return q.answers
      .filter(a => a.isCorrect)
      .map(a => a.answerText)
      .join(', ');
  }

  goHome() {
    this.router.navigateByUrl('/');
  }
  
  // 🎨 CSS-Klasse für Frage-Buttons zurückgeben
  getQuestionClass(q: Question): string {
    const key = q.globalId; // 🔑 statt eigener Funktion
    const userAns = this.userAnswers[key];
    if (!userAns || userAns.length === 0) {
      return 'secondary'; // unbeantwortet
    }

    if (q.type === 'fi') {
      return this.isFillInCorrect(q, userAns[0]) ? 'success' : 'danger';
    } else {
      const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
      const selected = userAns;
      const correct =
        correctIds.length === selected.length &&
        correctIds.every(id => selected.includes(id));
      return correct ? 'success' : 'danger';
    }
  }
}
