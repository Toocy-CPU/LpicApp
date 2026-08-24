import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type Category = 'lpic101' | 'lpic102';
type QType = 'sc' | 'mc' | 'fi';
type Mode = 'learn' | 'exam';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent {
  categories: Category[] = [];
  types: QType[] = [];
  mode: Mode = 'learn';
  shuffle = true;  
  limit: number | null = null;   // 👈 neue Option

  constructor(private router: Router) {}

  toggleArraySelection<T>(arr: T[], value: T) {
    const i = arr.indexOf(value);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(value);
  }

  start() {
    const cat = this.categories.length ? this.categories : ['lpic101', 'lpic102'];
    const ty  = this.types.length ? this.types : ['sc', 'mc', 'fi'];

    this.router.navigate(['/quiz'], {
      queryParams: {
        categories: cat.join(','),
        types: ty.join(','),
        mode: this.mode,
        shuffle: this.shuffle,
        limit: this.limit ?? undefined   // 👈 nur mitgeben wenn gesetzt
      }
    });
  }
}
