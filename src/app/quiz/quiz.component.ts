import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../question.service';
import { Question } from '../question';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  currentIndex = 0;
  mode: 'learn' | 'exam' = 'learn';

  // userAnswers: bei SC/MC = number[], bei FI = string[]
  userAnswers: { [qid: string]: number[] | string[] } = {};

  showFeedback = false;
  feedbackCorrect = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const categories = (params['categories'] || 'lpic101,lpic102').split(',');
      const types = (params['types'] || 'sc,mc,fi').split(',');
      this.mode = params['mode'] || 'learn';
      const shuffle = params['shuffle'] !== 'false'; // Standard = true
      const limit = params['limit'] ? parseInt(params['limit'], 10) : 0;
      this.questionService.getQuestions(categories as any, types as any, shuffle).subscribe(data => {
        // falls Limit gesetzt ist → Array kürzen
        this.questions = limit > 0 ? data.slice(0, limit) : data;
      });
    });
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentIndex] || null;
  }

  toggleAnswer(q: Question, answerId: number, textValue?: string) {
    if (q.type === 'sc') {
      this.userAnswers[q.globalId] = [answerId];
    } 
    else if (q.type === 'mc') {
      const arr = (this.userAnswers[q.globalId] as number[]) || [];
      if (arr.includes(answerId)) {
        this.userAnswers[q.globalId] = arr.filter(id => id !== answerId);
      } else {
        this.userAnswers[q.globalId] = [...arr, answerId];
      }
    } 
    else if (q.type === 'fi' && textValue !== undefined) {
      this.userAnswers[q.globalId] = [textValue];
    }

    if (this.mode === 'learn' && q.type !== 'fi') {
      this.checkFeedback(q);
    }
  }

  checkFeedback(q: Question) {
  const selected = (this.userAnswers[q.globalId] as number[]) || [];
  const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);

  if (q.type === 'mc') {
    // Prüfen nur, wenn die Anzahl der ausgewählten Antworten
    // gleich der Anzahl der richtigen Antworten ist
    if (selected.length !== correctIds.length) {
      this.showFeedback = false;
      return;
    }
  }

  this.feedbackCorrect = this.arraysEqual(
    [...selected].sort(),
    [...correctIds].sort()
  );
  this.showFeedback = true;
}


  checkFillInFeedback(q: Question, text: string) {
    const correctAnswers = q.answers
      .filter(a => a.isCorrect)
      .map(a => a.answerText.toLowerCase().trim());

    const given = text.toLowerCase().trim();
    this.feedbackCorrect = correctAnswers.includes(given);
    this.showFeedback = true;
  }

  nextQuestion() {
    this.showFeedback = false;
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      this.router.navigate(['/result'], {
        state: {
          questions: this.questions,
          userAnswers: this.userAnswers,
          mode: this.mode
        }
      });
    }
  }

  prevQuestion() {
    this.showFeedback = false;
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  goToQuestion(index: number) {
    this.showFeedback = false;
    this.currentIndex = index;
  }

  getNavButtonClass(q: Question, i: number): string {
    if (i === this.currentIndex) {
      return 'btn-primary';
    }

    const userAns = this.userAnswers[q.globalId];
    if (!userAns || userAns.length === 0) {
      return 'btn-outline-secondary';
    }

    if (q.type === 'fi') {
      const correctAnswers = q.answers
        .filter(a => a.isCorrect)
        .map(a => a.answerText.toLowerCase().trim());
      const given = String(userAns[0] || '').toLowerCase().trim();
      return correctAnswers.includes(given)
        ? 'btn-success'
        : 'btn-danger';
    } else {
      const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
      const selected = userAns as number[];

      const correct =
        correctIds.length === selected.length &&
        correctIds.every(id => selected.includes(id));

      return correct ? 'btn-success' : 'btn-danger';
    }
  }

  private arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  // Prüft, ob Antwort aId für Frage q ausgewählt ist (SC/MC)
  isSelected(q: Question, answerId: number): boolean {
    const arr = this.userAnswers[q.globalId] as number[] | undefined;
    return Array.isArray(arr) && arr.includes(answerId);
  }

  // Liefert den aktuellen Text für Fill-In als string
  getFillInValue(q: Question): string {
    const arr = this.userAnswers[q.globalId] as string[] | undefined;
    return arr && typeof arr[0] === 'string' ? arr[0] : '';
  }

  // Update für Fill-In bei Eingabeänderung
  onFillInChange(q: Question, value: string): void {
    this.toggleAnswer(q, -1, value);
  }
  trackByAnswer(_i: number, a: { id: number }) {
  return a.id;
}

onRadioChange(q: Question, answerId: number): void {
  this.userAnswers[q.globalId] = [answerId];
  if (this.mode === 'learn') this.checkFeedback(q);
}

onCheckboxChange(q: Question, answerId: number, checked: boolean): void {
  const arr = (this.userAnswers[q.globalId] as number[]) || [];
  this.userAnswers[q.globalId] = checked
    ? Array.from(new Set([...arr, answerId]))
    : arr.filter(id => id !== answerId);
  if (this.mode === 'learn') this.checkFeedback(q);
}

}
