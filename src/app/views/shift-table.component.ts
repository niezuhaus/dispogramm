import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Shift } from '../classes/Shift';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatMenuTrigger } from '@angular/material/menu';
import { GC } from '../common/GC';
import { Job } from '../classes/Job';
import { Price } from '../classes/Price';
import { Messenger } from '../classes/Messenger';

@Component({
  selector: 'shift-table',
  template: `
  <div>
    <table
      #table
      mat-table
      [dataSource]="dataSource"
      style="max-width: 100%;">
      <ng-container matColumnDef="number">
        <th mat-header-cell *matHeaderCellDef class="text-center" style="padding: unset; width: 50px">#</th>
        <td mat-cell *matCellDef="let element; let i = index" class="text-center">
          {{i + 1}}
        </td>
      </ng-container>
      <ng-container matColumnDef="date">
        <th mat-header-cell *matHeaderCellDef class="text-center">datum</th>
        <td mat-cell *matCellDef="let element" style="width: 240px">
          <div class="flex flex-row justify-content-evenly align-items-end w-100" style="width: fit-content">
            <a *ngIf="!element.edit" (click)="openShiftDialog(element)" 
               >
              <p class="text-center noMargin">
                {{element.start.dateStampShort()}}, {{shiftLiterals(element.type)}}
              </p>
            </a>


            <mat-form-field *ngIf="element.edit" style="width: 100px" class="relative-top8px">
              <mat-label>datum</mat-label>
              <div class="flex flex-row">
                <input matInput [matDatepicker]="picker" [(ngModel)]="element.start"
                       (keydown)="$event.key === 'Enter' ? updateShift(element) : ''">
                <i class="bi bi-calendar3" (click)="picker.open()"></i>
              </div>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field class="ml-3 relative-top8px" *ngIf="element.edit"
                            style="width: 100px">
              <mat-label>schichttyp</mat-label>
              <mat-select
                tabindex="-1"
                #type
                [(ngModel)]="element.type"
                (selectionChange)="element.startTimeGuess(); element.endTimeGuess()"
                (keydown)="$event.key === 'Enter' ? updateShift(element) : ''">
                <mat-option
                  *ngFor="let shiftType of messengerShiftTypes; let i = index"
                  [value]="i">
                  {{shiftType}}
                </mat-option>
              </mat-select>
            </mat-form-field>

          </div>
        </td>
      </ng-container>
      <ng-container matColumnDef="startend">
        <th mat-header-cell *matHeaderCellDef class="text-center" style="min-width: 80px">arbeitszeit</th>
        <td mat-cell *matCellDef="let element" style="width: 260px; padding: 0 20px !important;">
          <div *ngIf="element.edit" class="flex flex-row align-items-center justify-content-between">
            <timepicker
              [label]="'start'"
              [(time)]="element.start"
              (keydown)="$event.key === 'Enter' ? updateShift(element) : ''"
              class="relative-top8px"></timepicker>
            <span class="mx-2">-</span>
            <timepicker
              [label]="'ende'"
              [(time)]="element.end" [compareDate]="element.start"
              (keydown)="$event.key === 'Enter' ? updateShift(element) : ''"
              class="relative-top8px"></timepicker>
          </div>
          <div *ngIf="!element.edit" class="flex flex-row align-items-center justify-content-between">
            <span>{{element.start.timestamp()}}</span>
            <span class="mx-2">-</span>
            <span *ngIf="element.end">{{element.end?.timestamp()}}</span>
            <a *ngIf="!element.end" class="fex-warn" (click)="element.edit = true">endzeit eintragen</a>
          </div>

        </td>
      </ng-container>
      <ng-container matColumnDef="money">
        <th mat-header-cell *matHeaderCellDef class="text-center"></th>
        <td mat-cell *matCellDef="let element">
          <p class="text-center noMargin" *ngIf="element.shiftType <= 4 && !element.edit">
            {{element.money.netto}}
          </p>
          <div *ngIf="element.edit" class="flex justify-content-around">
            <button mat-button class="align-items-center"
                    (click)="updateShift(element)">
              <i class="bi bi-check"></i>
            </button>
          </div>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"
          (contextmenu)="onRightClick($event, row)"></tr>
    </table>
  </div>
  <div *ngIf="!shifts" class="flex justify-content-center align-items-center" style="height: 20vh">
            <h3>- keine schichten gefunden -</h3>
          </div>

            <div class="container">
              <div style="visibility: hidden; position: fixed"
                       [style.left.px]="menuTopLeftPosition.x"
                       [style.top.px]="menuTopLeftPosition.y"
                       [matMenuTriggerFor]="rightMenu">
                      </div>
                  <mat-menu #rightMenu="matMenu">
                    <ng-template matMenuContent let-item="item" let-onShiftDelete="onShiftDelete">
                      <right-click-menu
                        [shift]="item"
                        [onShiftDelete]="shiftDeleted.bind(this)">
                      </right-click-menu>
                    </ng-template>
                  </mat-menu>
                </div>
  `,
  styles: [
  ]
})
export class ShiftTableComponent implements OnInit {

  @ViewChild('table') table: MatTable<Shift>;
  dataSource: MatTableDataSource<Shift>;
  displayedColumns: string[] = ['number', 'date', 'startend', 'money'];
  menuTopLeftPosition = { x: 0, y: 0 };

  shifts: Shift[] = [];
  hours = 0;
  shiftsWithoutEnd = 0;
  jobsThisMonth: Job[] = [];

  get messengerShiftTypes() { return GC.dispatcherShiftLiterals.concat(GC.messengerShiftLiterals) };
  shiftLiterals = (index: number) => { return this.messengerShiftTypes[index]; }

  @Input() messenger: Messenger;
  @Input() onShiftDelete: (shifts: Shift[]) => void;
  @Output() shiftUpdated = new EventEmitter<boolean>();

  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  constructor() {
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Shift>(this.messenger.shifts);
  }

  shiftDeleted(shift: Shift): void {
    this.shifts = this.messenger.shifts
    this.dataSource.data = [...this.shifts];
    this.onShiftDelete(this.shifts)
  }

  updateShift(shift: Shift): void {
    if (shift.start.hoursDifference(shift.end) < 0) {
      GC.openSnackBarLong('die endzeit der schicht muss vor der startzeit liegen!');
      return;
    }
    shift.edit = false;

    let routine = () => {
      GC.loadShiftsToday(GC.http);
      this.shifts.sort((a, b) => { return a.start.getTime() - b.start.getTime() });
      this.shifts.forEach(shift => {
        shift.money = this.jobsThisMonth.filter(j => j.date.daysDifference(shift.start) === 0).reduce((p, a) => p._add(a.price), new Price())
      });
      this.shiftUpdated.emit(true);
    }

    if (!shift.id) {
      shift = new Shift(shift);
      shift.messenger.shift = null;
      shift.messenger.shifts = null;
      GC.http.createShift(shift).subscribe((s) => {
        routine();
      })
    } else {
      shift.update('schicht wurde aktualisiert.', true).subscribe(() => {
        routine();
      });
    }
  }

  newShift(date?: Date): void {
    const s = new Shift({ messenger: this.messenger, start: date });
    s.startTimeGuess(true);
    s.end = s.endTimeGuess();
    s.edit = true;
    this.dataSource.data.push(s);
    this.table.renderRows();
  }

  onRightClick(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX;
    this.menuTopLeftPosition.y = event.clientY;
    this.matMenuTrigger.menuData = { item: item, onShiftDelete: this.shiftDeleted.bind(this) }
    this.matMenuTrigger.openMenu();
  }

  openShiftDialog(shift: Shift): void {
    shift = new Shift(shift);
    shift.openDialog();
  }
}
