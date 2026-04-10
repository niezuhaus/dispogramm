import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Geolocation } from '../classes/Geolocation';
import { Job } from '../classes/Job';
import { Expense } from '../classes/Expense';

@Component({
  selector: 'app-new-expense-dialog',
  template: `
    <mat-tab-group dynamicHeight class="animated-width">
      <mat-tab label="{{ expense?.id ? 'auslage bearbeiten' : 'neue auslage hinzufügen' }}">
        <div class="pb-4 px-4">
          <!--    <div style="width: fit-content;">-->
          <!--      <mat-button-toggle-group [(ngModel)]="isBrutto" style="margin-bottom: 10px" class="flex flex-row">-->
          <!--        <mat-button-toggle [value]="false" (click)="isBrutto = false">netto</mat-button-toggle>-->
          <!--        <mat-button-toggle [value]="true" (click)="isBrutto = true">brutto</mat-button-toggle>-->
          <!--      </mat-button-toggle-group>-->
          <!--    </div>-->

          <div class="flex flex-column">
            <div class="flex flex-row">
              <mat-form-field class="mr-4" style="max-width: 200px">
                <mat-label>beschreibung</mat-label>
                <input #search matInput cdkFocusInitial [(ngModel)]="expense.description" />
              </mat-form-field>

              <mat-form-field style="width: 75px">
                <mat-label>euro</mat-label>
                <input #value matInput type="number" (click)="value.select()" [(ngModel)]="expense.price._brutto" />
              </mat-form-field>
            </div>

            <div class="w-100 flex flex-row justify-between">
              <button mat-raised-button class="fex-button" (click)="save()" mat-dialog-close>speichern</button>
              <button mat-raised-button class="fex-button-warn" [class.hidden]="!expense.id" (click)="delete()" mat-dialog-close>löschen</button>
            </div>
          </div>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: []
})
export class NewExpenseDialogComponent implements OnInit {
  expense = new Expense();

  @HostListener('keydown.enter')
  onEnter(): void {
    this.save();
    this.dialogRef.close();
  }

  constructor(
    private dialogRef: MatDialogRef<NewExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      expense: Expense;
      job: Job;
    }
  ) {
    if (data.expense) {
      this.expense = data.expense;
    } else {
      this.expense.description = '';
      this.expense.jobId = data.job.id;
      this.expense.clientId = data.job.client.id;
      this.expense.date = data.job.date.copy();
    }
  }

  ngOnInit(): void {}

  save(): void {
    this.data.job.addExpense(this.expense);
  }

  delete(): void {
    this.data.job.deleteExpense(this.expense);
  }
}
