import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

interface DocumentItem {
  id: number;
  title: string;
  content: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  private apiUrl = 'https://ajaja-document-editor-e0y1.onrender.com/api';

  documents: DocumentItem[] = [];

  selectedDocumentId: number | null = null;

  documentTitle = '';
  documentContent = '';

  saveStatus = 'Ready';

  showShareModal = false;

  shareEmail = '';
  sharePermission = 'View';
  shareUrl = '';

  constructor(private http: HttpClient) {
    this.loadDocuments();
  }

  // ================================
  // LOAD DOCUMENTS
  // ================================

  loadDocuments(): void {
    this.http
      .get<DocumentItem[]>(`${this.apiUrl}/Documents`)
      .subscribe({
        next: (data) => {
          this.documents = data;

          if (data.length > 0) {
            this.selectDocument(data[0]);
          } else {
            this.selectedDocumentId = null;
            this.documentTitle = '';
            this.documentContent = '';
            this.saveStatus = 'No documents';
          }
        },
        error: () => {
          this.saveStatus = 'Unable to load documents';
        }
      });
  }

  // ================================
  // SELECT DOCUMENT
  // ================================

  selectDocument(document: DocumentItem): void {
    this.selectedDocumentId = document.id;
    this.documentTitle = document.title;
    this.documentContent = document.content;

    this.saveStatus = 'Saved';

    setTimeout(() => {
      if (this.editor) {
        this.editor.nativeElement.innerHTML = document.content;
      }
    });
  }

  // ================================
  // CREATE DOCUMENT
  // ================================

  createNewDocument(): void {

    const newDocument = {
      title: 'Untitled Document',
      content: '<p>Start writing your document...</p>',
      ownerEmail: 'padhipriti755@gmail.com'
    };

    this.http
      .post<DocumentItem>(
        `${this.apiUrl}/Documents`,
        newDocument
      )
      .subscribe({
        next: (document) => {

          this.documents.unshift(document);

          this.selectDocument(document);

          this.saveStatus = 'Saved';
        },

        error: () => {
          this.saveStatus = 'Unable to create document';
        }
      });
  }

  // ================================
  // SAVE DOCUMENT
  // ================================

  saveDocument(): void {

    if (!this.selectedDocumentId) {
      return;
    }

    const updatedDocument = {
      title: this.documentTitle.trim(),
      content: this.documentContent
    };

    if (!updatedDocument.title) {
      this.saveStatus = 'Title is required';
      return;
    }

    this.saveStatus = 'Saving...';

    this.http
      .put<DocumentItem>(
        `${this.apiUrl}/Documents/${this.selectedDocumentId}`,
        updatedDocument
      )
      .subscribe({

        next: (document) => {

          const index = this.documents.findIndex(
            d => d.id === document.id
          );

          if (index !== -1) {
            this.documents[index] = document;
          }

          this.saveStatus = 'Saved';
        },

        error: () => {
          this.saveStatus = 'Save failed';
        }

      });
  }

  // ================================
  // DELETE DOCUMENT
  // ================================

  deleteDocument(document: DocumentItem): void {

    const confirmed = confirm(
      `Are you sure you want to delete "${document.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.http
      .delete<any>(
        `${this.apiUrl}/Documents/${document.id}`
      )
      .subscribe({

        next: () => {

          // Remove document from sidebar
          this.documents = this.documents.filter(
            d => d.id !== document.id
          );

          // If deleted document was selected
          if (this.selectedDocumentId === document.id) {

            if (this.documents.length > 0) {
              this.selectDocument(this.documents[0]);
            } else {

              this.selectedDocumentId = null;
              this.documentTitle = '';
              this.documentContent = '';
              this.saveStatus = 'No documents';
            }
          }

        },

        error: () => {
          alert('Unable to delete document.');
        }

      });
  }

  // ================================
  // EDITOR INPUT
  // ================================

  onEditorInput(): void {

    if (this.editor) {
      this.documentContent =
        this.editor.nativeElement.innerHTML;
    }

    this.saveStatus = 'Unsaved changes';

    this.autoSave();
  }

  // ================================
  // AUTO SAVE
  // ================================

  private autoSave(): void {

    setTimeout(() => {

      if (this.saveStatus === 'Unsaved changes') {
        this.saveDocument();
      }

    }, 1000);
  }

  // ================================
  // FORMATTING
  // ================================

  formatText(command: string): void {

    document.execCommand(command, false);

    this.editor.nativeElement.focus();

    this.onEditorInput();
  }

  // ================================
  // HEADING
  // ================================

  formatHeading(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    const value = select.value;

    if (value) {

      document.execCommand(
        'formatBlock',
        false,
        value
      );

      this.onEditorInput();
    }

    this.editor.nativeElement.focus();

    select.value = '';
  }

  // ================================
  // SHARE MODAL
  // ================================

  openShareModal(): void {

    if (!this.selectedDocumentId) {

      alert(
        'Please create or select a document first.'
      );

      return;
    }

    this.shareEmail = '';

    this.sharePermission = 'View';

    this.shareUrl = '';

    this.showShareModal = true;
  }

  closeShareModal(): void {
    this.showShareModal = false;
  }

  // ================================
  // GENERATE SHARE LINK
  // ================================

  generateShareLink(): void {

    if (!this.shareEmail.trim()) {

      alert(
        'Please enter an email address.'
      );

      return;
    }

    if (!this.selectedDocumentId) {
      return;
    }

    const shareData = {

      documentId: this.selectedDocumentId,

      sharedWithEmail:
        this.shareEmail.trim(),

      permission:
        this.sharePermission

    };

    this.http
      .post<any>(
        `${this.apiUrl}/DocumentShares`,
        shareData
      )
      .subscribe({

        next: (response) => {

          this.shareUrl =
            `${window.location.origin}/shared/${response.shareToken}`;

        },

        error: () => {

          alert(
            'Unable to generate share link.'
          );

        }

      });
  }

  // ================================
  // COPY SHARE LINK
  // ================================

  copyShareLink(): void {

    navigator.clipboard
      .writeText(this.shareUrl)
      .then(() => {

        alert(
          'Share link copied!'
        );

      });

  }
}