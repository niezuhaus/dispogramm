import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class SaveAttemptErrorStateMatcher implements ErrorStateMatcher {
  constructor(private shouldShowErrors: () => boolean) {}
  isErrorState(control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean {
    return !!control && control.invalid && (control.touched || control.dirty || this.shouldShowErrors());
  }
}
