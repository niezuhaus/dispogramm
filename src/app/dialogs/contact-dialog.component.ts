import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Contact } from '../classes/Contact';
import { GC } from '../common/GC';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Client } from '../classes/Client';
import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

class SaveAttemptErrorStateMatcher implements ErrorStateMatcher {
  constructor(private shouldShowErrors: () => boolean) {}
  isErrorState(control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean {
    return !!control && control.invalid && (control.touched || control.dirty || this.shouldShowErrors());
  }
}

@Component({
  selector: 'app-edit-contact-dialog',
  template: `
    <div [appShakeOnInvalidSubmit]="saveAttemptCount" [appShakeInvalid]="!canSave()">
      <mat-tab-group dynamicHeight class="animated-width">
        <mat-tab label="neuen kontakt erstellen">
          <div class="pb-4 px-4">
            <div style="width: 300px">
              <mat-form-field class="w-100">
                <mat-label>name</mat-label>
                <input
                  #name
                  type="text"
                  matInput
                  required
                  [(ngModel)]="contact.name"
                  cdkFocusInitial
                  [errorStateMatcher]="saveAttemptMatcher"
                  #nameModel="ngModel"
                />
                <mat-error *ngIf="nameModel.hasError('required')">feld darf nicht leer sein</mat-error>
              </mat-form-field>
              <mat-form-field class="w-100">
                <mat-label>telefon</mat-label>
                <input #nick type="text" matInput [(ngModel)]="contact.phone" />
              </mat-form-field>
              <mat-form-field class="w-100">
                <mat-label>e-mail</mat-label>
                <input type="email" email matInput [(ngModel)]="contact.email" [errorStateMatcher]="saveAttemptMatcher" #emailModel="ngModel" />
                <mat-error *ngIf="emailModel.hasError('email')">die mailadresse ist ungültig</mat-error>
              </mat-form-field>
              <mat-form-field class="w-100">
                <mat-label>weitere infos</mat-label>
                <textarea matInput [(ngModel)]="contact.info"></textarea>
              </mat-form-field>
            </div>
            <button mat-raised-button class="fex-button" (click)="onSaveClicked()">speichern</button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: []
})
export class ContactDialogComponent implements OnInit {
  contact: Contact = new Contact();
  client: Client;
  saveAttempted = false;
  saveAttemptCount = 0;
  saveAttemptMatcher: ErrorStateMatcher;

  @Output() created = new EventEmitter<Contact>();
  @Output() updated = new EventEmitter<Contact>();
  @Output() deleted = new EventEmitter<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      contact: Contact;
      client: Client;
    }
  ) {
    this.saveAttemptMatcher = new SaveAttemptErrorStateMatcher(() => this.saveAttempted);
    if (data.contact) {
      this.contact = data.contact;
    }
    if (data.client) {
      this.client = data.client;
    }
  }

  ngOnInit(): void {}

  canSave(): boolean {
    return !!(this.contact.name || '').trim();
  }

  onSaveClicked(): void {
    this.saveAttempted = true;
    this.saveAttemptCount += 1;
    if (!this.canSave()) return;
    this.save();
  }

  save(): void {
    if (!this.contact.client) {
      this.contact.client = this.client;
    }
    GC.http.createContact(this.contact).subscribe((msg) => {
      this.created.emit(msg);
      GC.openSnackBarLong(`${msg.name} wurde als kontakt angelegt`);
      GC.dialog.closeAll();
    });
  }
}
