import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AreYouSureDialogComponent } from '../dialogs/are-you-sure-dialog.component';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  save(): void;
}

@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(component: HasUnsavedChanges): Observable<boolean> | boolean {
    if (!component.hasUnsavedChanges()) return true;

    const result$ = new Subject<boolean>();
    const dialogRef = this.dialog.open(AreYouSureDialogComponent, {
      data: {
        headline: 'ungespeicherte änderungen',
        text: 'möchtest du die änderungen speichern?',
        verbYes: 'speichern',
        verbThird: 'verwerfen',
        verbNo: 'abbrechen'
      }
    });

    dialogRef.componentInstance.confirm.pipe(take(1)).subscribe(() => { component.save(); result$.next(true); });
    dialogRef.componentInstance.third.pipe(take(1)).subscribe(() => result$.next(true));
    dialogRef.componentInstance.cancel.pipe(take(1)).subscribe(() => result$.next(false));
    dialogRef.afterClosed().pipe(take(1)).subscribe(() => result$.next(false));

    return result$.pipe(take(1));
  }
}
