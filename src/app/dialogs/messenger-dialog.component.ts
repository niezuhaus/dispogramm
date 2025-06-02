import { Component, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from '../classes/Job';
import { GC } from '../common/GC';
import { Price } from '../classes/Price';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AreYouSureDialogComponent } from './are-you-sure-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { Shift } from '../classes/Shift';
import { Messenger } from '../classes/Messenger';
import { MatTabGroup } from '@angular/material/tabs';
import { MatInput } from '@angular/material/input';
import { MatSort, Sort } from '@angular/material/sort';
import { ShiftTableComponent } from '../views/shift-table.component';

@Component({
  selector: 'app-edit-messenger-dialog',
  template: `
    <mat-tab-group dynamicHeight [selectedIndex]="data?.selectedIndex || 0" #tabgroup style="color: black" [headerPosition]="">
      <mat-tab [label]="new ? 'neue kurier:in' : messenger.nickname + ' bearbeiten'">
        <div class="flex flex-row px-4">
          <mat-form-field class="mr-4 w-25" style="min-width: 200px">
            <mat-label>vorname</mat-label>
            <input type="text" #name matInput (keyup)="messenger.nickname = messenger.id ? messenger.nickname : name.value.toLowerCase()" [(ngModel)]="messenger.firstName" />
          </mat-form-field>
          <mat-form-field class="mr-4 w-25" style="min-width: 200px">
            <mat-label>nachname</mat-label>
            <input type="text" matInput [(ngModel)]="messenger.lastName" />
          </mat-form-field>
          <mat-form-field class="w-25" style="min-width: 200px">
            <mat-label>personalnummer</mat-label>
            <input type="text" matInput [(ngModel)]="messenger.messengerId" />
          </mat-form-field>
        </div>
        <div class="px-4 flex flex-row">
          <mat-form-field class="mr-4 w-25" style="min-width: 200px">
            <mat-label>rufname</mat-label>
            <input #nick type="text" matInput (keyup)="nick.value = nick.value.toLowerCase()" [(ngModel)]="messenger.nickname" />
          </mat-form-field>
          <mat-form-field class="w-25" style="min-width: 200px">
            <mat-label>telefonnummer</mat-label>
            <input type="text" matInput [(ngModel)]="messenger.telNumber" />
          </mat-form-field>
        </div>
        <div class="flex flex-row">
          <div class="mr-5 ml-3">
            <mat-checkbox [(ngModel)]="messenger.dispatcher">ist disponent:in</mat-checkbox>
          </div>
          <div>
            <mat-checkbox [(ngModel)]="messenger.active">fährt im tagesgeschäft</mat-checkbox>
          </div>
        </div>
      </mat-tab>

      <mat-tab *ngIf="messenger.id" [label]="'schichten (' + messenger.shifts?.length + ')'">
        <div *ngIf="!new" class="p-4">
          <div class="mb-3 flex flex-row align-items-center justify-content-between">
            <datepicker #datepicker [(date)]="date" [monthly]="true" (dateChange)="load()"> </datepicker>
            <button *ngIf="messenger.shifts?.length > 0" mat-raised-button class="fex-button" (click)="exportShifts(messenger, date)">lohndatei <i class="ml-3 bi bi-download"></i></button>
            <button mat-raised-button class="fex-button" (click)="shiftTable.newShift()" matTooltip="neue schicht hinzufügen">schicht hinzufügen <i class="ml-3 bi bi-plus-circle"></i></button>
          </div>

          <div *ngIf="loaded && messenger.shifts.length" class="mb-4" style="max-height: 50vh; overflow-y: scroll; overflow-x: hidden">
            <shift-table [messenger]="messenger" #table> </shift-table>
          </div>

          <h2 *ngIf="!messenger.shifts.length" class="center">- keine schichten bisher -</h2>

          <p *ngIf="messenger.active && messenger.shifts?.length">
            umsatz diesen monat: {{ salesNettoThisMonth._netto }} netto / {{ salesBruttoThisMonth._brutto }} brutto<br />
            insgesamt {{ messenger.hours }} stunden
          </p>
        </div>
      </mat-tab>
    </mat-tab-group>

    <div class="flex flex-row justify-content-between align-items-center p-4" style="min-width: 650px">
      <button mat-raised-button class="flex fex-button" (click)="updateMessenger()" matDialogClose>
        {{ messenger.id ? 'speichern' : 'hinzufügen' }}
      </button>
      <span class="fex-warn" *ngIf="messenger.shiftsWithoutEnd > 0">
        für {{ messenger.shiftsWithoutEnd === 1 ? 'eine' : messenger.shiftsWithoutEnd }} schicht{{ messenger.shiftsWithoutEnd > 1 ? 'en' : '' }} wurde noch keine endzeit eingetragen
      </span>
      <!-- <button *ngIf="isDezwo" mat-raised-button
              class="flex fex-button"
              (click)="deleteMessenger()"
              matDialogClose>
        löschen
      </button> -->
    </div>
  `,
  styles: []
})
export class MessengerDialogComponent implements OnInit {
  messenger: Messenger = new Messenger();

  shifts: Shift[] = [];
  jobsThisMonth: Job[] = [];
  salesNettoThisMonth = new Price();
  salesBruttoThisMonth = new Price();
  new = true;
  saved = new EventEmitter<boolean>();
  date = new Date();
  loaded = false;

  get isDezwo() {
    return GC._isDezwo;
  }
  get routes() {
    return GC.routes;
  }

  @ViewChild('tabgroup') tabgroup: MatTabGroup;
  @ViewChild('name') nameInput: MatInput;
  @ViewChild('table') shiftTable: ShiftTableComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      messenger: Messenger;
      shifts: Shift[];
      selectedIndex: number;
      createShiftFor: Date;
    }
  ) {
    if (data?.messenger) {
      this.messenger = data.messenger.copy();
      this.new = false;
    }
  }

  ngOnInit(): void {
    if (!this.new) {
      GC.http.jobsThisMonthForMessenger(this.messenger).subscribe((list) => {
        this.jobsThisMonth = list;
        list.forEach((j) => {
          j.billingTour ? this.salesNettoThisMonth.add(j.price) : this.salesBruttoThisMonth.add(j.price);
        });
        this.load();
        if (this.data.createShiftFor) {
          setTimeout(() => {
            this.shiftTable.newShift(this.data.createShiftFor);
          }, 100);
        }
      });
    }
  }

  load(): void {
    this.messenger.loadShifts(this.date).subscribe((shifts) => {
      this.shifts = shifts;
      this.init();
    });
  }

  init(): void {
    if (!this.shifts) {
      this.shifts = this.messenger.shifts;
    }
    this.messenger.shifts.forEach((shift) => {
      shift.money = this.jobsThisMonth.filter((j) => j.date.daysDifference(shift.start) === 0).reduce((p, a) => p._add(a.price), new Price());
    });

    this.loaded = true;
  }

  updateMessenger(): void {
    let m = new Messenger(this.messenger);
    m.shifts = null;
    m.shift = null;
    m.jobs = null;

    if (!this.new) {
      this.shifts
        .filter((s) => s.edit === true)
        .forEach((s) => {
          this.shiftTable.updateShift(s);
        });
      GC.http.updateMessenger(m).subscribe((m) => {
        GC.openSnackBarLong(`${m.nickname} wurde aktualisiert.`);
        this.saved.emit(true);
      });
    } else {
      GC.http.createMessenger(this.messenger).subscribe((m) => {
        GC.openSnackBarLong(`${m.nickname} wurde hinzugefügt.`);
        this.saved.emit(true);
      });
    }
  }

  deleteMessenger(): void {
    GC.http.deleteMessenger(this.messenger).subscribe(() => {
      GC.openSnackBarLong('kurier:in gelöscht');
    });
  }

  exportShifts(messenger: Messenger, date: Date): void {
    if (this.messenger.shiftsWithoutEnd > 0) {
      GC.dialog.open(AreYouSureDialogComponent, {
        data: {
          headline: `bitte erst für ${this.messenger.shiftsWithoutEnd} schichten die endzeiten eintragen`,
          verbNo: 'schließen'
        }
      });
    } else {
      GC.http.exportShfitsForMessengerAndMonth(messenger, date).subscribe((xml) => {
        const blob = new Blob([xml], { type: 'application/xml' });
        const link = document.createElement('a');
        link.download = `Stundenerfassung_${date.getFullYear()}_${GC.monthLiteralsShort[date.getMonth()]}_${messenger.messengerId}_${messenger.lastName}_${messenger.firstName}.xml`;
        link.href = window.URL.createObjectURL(blob);
        link.click();
      });
    }
  }
}
