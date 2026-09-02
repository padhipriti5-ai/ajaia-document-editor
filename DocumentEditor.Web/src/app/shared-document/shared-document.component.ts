import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-shared-document',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-document.component.html',
  styleUrl: './shared-document.component.css'
})
export class SharedDocumentComponent implements OnInit {

  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  private apiUrl = 'https://ajaja-document-editor-e0y1.onrender.com/api';

  document: any = null;
  token = '';

  loading = true;
  errorMessage = '';
  saveStatus = 'Saved';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'Invalid share link.';
      this.loading = false;
      return;
    }

    this.loadSharedDocument();
  }

  loadSharedDocument(): void {
    this.http
      .get<any>(`${this.apiUrl}/SharedDocuments/${this.token}`)
      .subscribe({
        next: (data) => {
          this.document = data;
          this.loading = false;

          setTimeout(() => {
            if (this.editor) {
              this.editor.nativeElement.innerHTML = data.content || '';
            }
          });
        },
        error: () => {
          this.errorMessage = 'This share link is invalid or expired.';
          this.loading = false;
        }
      });
  }

  saveDocument(): void {
    if (!this.document || this.document.permission !== 'Edit') {
      return;
    }

    this.saveStatus = 'Saving...';

    const data = {
      title: this.document.title,
      content: this.document.content
    };

    this.http
      .put<any>(
        `${this.apiUrl}/SharedDocuments/${this.token}`,
        data
      )
      .subscribe({
        next: () => {
          this.saveStatus = 'Saved';
        },
        error: (error) => {
          this.saveStatus =
            error.status === 403
              ? 'View permission only'
              : 'Save failed';
        }
      });
  }

  onContentInput(): void {
    if (!this.editor) {
      return;
    }

    this.document.content =
      this.editor.nativeElement.innerHTML;

    this.saveStatus = 'Unsaved changes';
  }
}