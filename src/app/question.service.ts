import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of } from 'rxjs';
import { Question } from './question';

type Category = 'lpic101' | 'lpic102';
type QType = 'sc' | 'mc' | 'fi';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getQuestions(
    categories: Category[] = ['lpic101', 'lpic102'],
    types: QType[] = [],
    shuffle = true,
    limit?: number
  ): Observable<Question[]> {
    const calls = categories.map(cat =>
      this.http.get<Question[]>(`${this.baseUrl}/${cat}`).pipe(
        map(qs =>
          qs.map(q => ({
            ...q,
            category: cat,
            globalId: `${cat}_${q.id}` // 🔑 global eindeutige ID
          }))
        )
      )
    );

    if (!calls.length) return of([]);

    return forkJoin(calls).pipe(
      map(arrays => arrays.flat()),
      map(qs => (types.length ? qs.filter(q => types.includes(q.type)) : qs)),
      map(qs => (shuffle ? this.shuffle(qs) : qs)),
      map(qs => (limit ? qs.slice(0, limit) : qs))   // 👈 Limit anwenden
    );
  }
  private shuffle<T>(list: T[]): T[] {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
