import { Routes } from '@angular/router';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { QuizComponent } from './quiz/quiz.component';
import { ResultComponent } from './result/result.component';

export const routes: Routes = [
  { path: '', component: StartScreenComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '' }
];