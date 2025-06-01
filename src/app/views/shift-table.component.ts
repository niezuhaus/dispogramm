import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Shift } from '../classes/Shift';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatMenuTrigger } from '@angular/material/menu';
import { GC, ShiftType } from '../common/GC';
import { Job } from '../classes/Job';
import { Price } from '../classes/Price';
import { Messenger } from '../classes/Messenger';
import { TimepickerComponent } from './timepicker.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'shift-table',
  template: `
    <div>
      <div class="table-container w-100" [@tableExpand]="expanded ? 'expanded' : 'collapsed'" [class.expanded]="expanded || shifts?.length < 6 || editMode">
        <table id="table" #table mat-table [dataSource]="dataSource" style="max-width: 100%;">
          <ng-container matColumnDef="number">
            <th mat-header-cell *matHeaderCellDef class="text-center" style="padding: unset; width: 50px">#</th>
            <td mat-cell *matCellDef="let element; let i = index" class="text-center">
              <div *ngIf="!element.edit">
                {{ i + 1 }}
              </div>
              <div *ngIf="element.edit">
                <button matTooltip="abbrechen" mat-button class="align-items-center" (click)="abortEdit(element)">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef class="text-center">datum</th>
            <td mat-cell *matCellDef="let element" [style.width]="element.edit ? 380 : 250 + 'px'">
              <div class="flex flex-row justify-content-around align-items-center w-100" style="width: fit-content">
                <a *ngIf="!element.edit" (click)="openShiftDialog(element)">
                  <p class="text-align-left noMargin">{{ element.start.dateStampShort() }}, {{ shiftLiterals(element.type) }}</p>
                </a>

                <button *ngIf="element.edit" mat-icon-button class="mr-4" (click)="element.start = element.start.previousWorkingDay()">
                  <i class="bi bi-dash-square"></i>
                </button>
                <div *ngIf="element.edit" style="width: 130px" class="relative-top8px flex flex-row justify-between">
                  <mat-form-field>
                    <mat-label>datum</mat-label>
                    <div class="flex flex-row align-items-center">
                      <span class="mr-1">
                        {{ element.start.getDayLiteral() + ',' }}
                      </span>
                      <input
                        matInput
                        #dateInput
                        [matDatepickerFilter]="weekDayFilter"
                        [matDatepicker]="picker"
                        [(ngModel)]="element.start"
                        (keydown)="$event.key === 'Enter' ? updateShift(element) : ''"
                      />
                      <i class="bi bi-calendar3" (click)="picker.open()"></i>
                    </div>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>
                <button *ngIf="element.edit" mat-icon-button class="ml-4" (click)="element.start = element.start.nextWorkingDay(true)">
                  <i class="bi bi-plus-square"></i>
                </button>

                <mat-form-field class="ml-3 relative-top8px" *ngIf="element.edit" style="width: 100px">
                  <mat-label>schichttyp</mat-label>
                  <mat-select tabindex="-1" #type [(ngModel)]="element.type" (selectionChange)="element.startTimeGuess(null, true)" (keydown)="$event.key === 'Enter' ? updateShift(element) : ''">
                    <mat-option *ngFor="let shiftType of messengerShiftTypes; let i = index" [value]="i" [disabled]="i <= 1 && !element.messenger.dispatcher">
                      {{ shiftType }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="startend">
            <th mat-header-cell *matHeaderCellDef class="text-center" style="min-width: 80px">arbeitszeit</th>
            <td mat-cell *matCellDef="let element" style="width: 200px; padding: 0 20px !important;">
              <div *ngIf="element.edit" class="flex flex-row align-items-center justify-content-between">
                <timepicker
                  [label]="'start'"
                  [(time)]="element.start"
                  (keydown)="$event.key === 'Enter' ? updateShift(element) : ''"
                  class="relative-top8px"
                  tabindex="2"
                  #startTimepicker
                  (timeChange)="endTimepicker.makeFiveHoursShift($event)"
                ></timepicker>
                <span class="mx-2">-</span>
                <timepicker
                  [label]="'ende'"
                  [(time)]="element.end"
                  [compareDate]="element.start"
                  (keydown)="$event.key === 'Enter' ? updateShift(element) : ''"
                  class="relative-top8px"
                  #endTimepicker
                ></timepicker>
              </div>
              <div *ngIf="!element.edit" class="flex flex-row align-items-center justify-content-between">
                <span>{{ element.start.timestamp() }}</span>
                <span class="mx-2">-</span>
                <span *ngIf="element.end">{{ element.end?.timestamp() }}</span>
                <a *ngIf="!element.end" class="fex-warn" (click)="enableEditMode(element)">endzeit eintragen</a>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="money">
            <th mat-header-cell *matHeaderCellDef class="text-center" style="min-width: 50px"></th>
            <td mat-cell *matCellDef="let element">
              <div *ngIf="!element.edit" class="flex justify-content-around">
                <button mat-button matTooltip="schicht bearbeiten" (click)="enableEditMode(element)">
                  <i class="bi bi-pencil small"></i>
                </button>
              </div>
              <p class="text-center noMargin" *ngIf="element.shiftType <= 4 && !element.edit">
                {{ element.money.netto }}
              </p>
              <div *ngIf="element.edit" class="flex justify-content-around">
                <button matTooltip="speichern" mat-button class="align-items-center" (click)="updateShift(element)">
                  <i class="bi bi-check"></i>
                </button>
              </div>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" (contextmenu)="onRightClick($event, row)"></tr>
        </table>
      </div>
      <div *ngIf="shifts.length >= 6" class="expand-button flex flex-col align-items-center" style="text-align: center;">
        <button mat-icon-button (click)="expanded = !expanded">
          <i class="bi" style="color: black" [ngClass]="expanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <span>{{ shifts.length - 5 }} weitere schicht{{ shifts.length == 6 ? '' : 'en' }} {{ expanded ? 'ausblenden' : 'anzeigen' }}</span>
      </div>
    </div>
    <div *ngIf="!shifts" class="flex justify-content-center align-items-center" style="height: 20vh">
      <h3>- keine schichten gefunden -</h3>
    </div>
    <div class="container">
      <div style="visibility: hidden; position: fixed" [style.left.px]="menuTopLeftPosition.x" [style.top.px]="menuTopLeftPosition.y" [matMenuTriggerFor]="rightMenu"></div>
      <mat-menu #rightMenu="matMenu">
        <ng-template matMenuContent let-item="item" let-onShiftDelete="onShiftDelete">
          <right-click-menu [shift]="item" [onShiftDelete]="removeShift.bind(this)"></right-click-menu>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styles: [
    `
          .table-container {
            overflow: hidden;
            position: relative;
          }
          .expand-button {
            margin-top: 10px;
          }
        `
  ],
  animations: [
    trigger('tableExpand', [
      state(
        'collapsed',
        style({
          height: '300px',
          overflow: 'hidden'
        })
      ),
      state(
        'expanded',
        style({
          height: '*'
        })
      ),
      transition('collapsed <=> expanded', animate('200ms ease-in-out'))
    ])
  ]
})
export class ShiftTableComponent implements OnInit {
  dataSource: MatTableDataSource<Shift>;
  displayedColumns: string[] = ['number', 'date', 'startend', 'money'];
  menuTopLeftPosition = { x: 0, y: 0 };

  shifts: Shift[] = [];
  hours = 0;
  shiftsWithoutEnd = 0;
  jobsThisMonth: Job[] = [];

  expanded: boolean = false;

  weekDayFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };

  get editMode(): boolean {
    return this.shifts.map((shift) => shift.edit).includes(true);
  }

  get messengerShiftTypes() {
    return GC.dispatcherShiftLiterals.concat(GC.messengerShiftLiterals);
  }

  distinctShiftTypes(shift: Shift): string[] {
    return shift.messenger.dispatcher ? this.messengerShiftTypes : GC.messengerShiftLiterals;
  }

  shiftLiterals = (index: number) => {
    return this.messengerShiftTypes[index];
  };

  @Input() messenger: Messenger;
  @Input() shiftDeleted = new EventEmitter<Shift>();
  @Output() shiftUpdated = new EventEmitter<boolean>();
  @Output() shiftCreated = new EventEmitter<Shift>();

  @ViewChild('table') table: MatTable<Shift>;
  @ViewChild('table') tableElement: HTMLElement;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  constructor() {}

  ngOnInit(): void {
    this.shifts = this.messenger.shifts;
    this.dataSource = new MatTableDataSource<Shift>(this.shifts);
  }

  enableEditMode(shift: Shift): void {
    shift.edit = true;
    GC.cd.detectChanges();
  }

  removeShift(shift: Shift): void {
    this.shifts.findAndRemove(shift);
    this.dataSource.data = [...this.shifts];
    this.shiftDeleted.emit(shift);
    this.table.renderRows();
  }

  updateShift(shift: Shift): void {
    if (shift.start.hoursDifference(shift.end) < 0) {
      GC.openSnackBarLong('die endzeit der schicht muss vor der startzeit liegen!');
      return;
    }
    shift.edit = false;

    let routine = (shift: Shift) => {
      this.shifts.push(shift);
      this.shifts.sort((a, b) => {
        return a.start.getTime() - b.start.getTime();
      });
      this.shifts.forEach((shift) => {
        shift.money = this.jobsThisMonth.filter((j) => j.date.daysDifference(shift.start) === 0).reduce((p, a) => p._add(a.price), new Price());
      });
    };

    if (!shift.id) {
      shift = new Shift(shift);
      shift.messenger.shift = null;
      shift.messenger.shifts = null;
      GC.openSnackBarLong(GC.shiftLiterals[shift.type] + '-schicht wurde erstellt');

      GC.http.createShift(shift).subscribe((s) => {
        routine(s);
        this.shiftCreated.emit(s);
      });
    } else {
      shift.update('schicht wurde aktualisiert.', true).subscribe((s) => {
        routine(s);
        this.shiftUpdated.emit(true);
      });
    }
  }

  newShift(date?: Date, type?: ShiftType): void {
    if (!type) {
      type = ShiftType.zwischi;
    }
    if (!date) {
      date = new Date();
    }
    const s = new Shift({ messenger: this.messenger, start: date, type: type }, this.messenger.dispatcher);
    s.start = s.startTimeGuess();
    s.end = s.endTimeGuess();
    s.edit = true;
    this.dataSource.data.push(s);
    this.table.renderRows();
  }

  abortEdit(shift: Shift): void {
    if (!shift.id) {
      const index = this.dataSource.data.indexOf(shift);
      if (index > -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
        this.table.renderRows();
      }
    } else {
      shift.edit = false;
    }
  }

  onRightClick(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX;
    this.menuTopLeftPosition.y = event.clientY;
    this.matMenuTrigger.menuData = { item: item, onShiftDelete: this.removeShift.bind(this) };
    this.matMenuTrigger.openMenu();
  }

  openShiftDialog(shift: Shift): void {
    shift = new Shift(shift);
    shift.openDialog();
  }
}
