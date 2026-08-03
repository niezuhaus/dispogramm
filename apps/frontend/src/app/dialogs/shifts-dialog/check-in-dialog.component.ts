import { AfterViewInit, Component, ComponentRef, Inject, ViewChild } from '@angular/core';
import { removeItem, setItem } from '../../UTIL';
import { GC, ShiftType } from '../../common/GC';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimepickerComponent } from '../../views/timepicker.component';
import { MatSelect } from '@angular/material/select';
import { Shift } from '../../classes/Shift';
import { MatMenuTrigger } from '@angular/material/menu';
import { NewShiftComponent } from './new-shift.component';

@Component({
  selector: 'change-user-dialog',
  template: `
    <mat-tab-group>
      <mat-tab label="kurier:innen ein- und auschecken">
        <div *ngIf="data?.morning" class="dialog-greeting pl-4 pt-4 pb-1">
          <span class="greeting-main">guten morgen!</span>
          <span class="greeting-sub">wer ist heute am start?</span>
        </div>
        <div *ngIf="!data?.morning" class="dialog-greeting pl-4 pt-4 pb-1">
          <span class="greeting-main">wer ist in der schicht?</span>
        </div>

        <div id="change-user-content" class="mt-2 justify-content-around" style="min-width: 400px">
          <div class="flex flex-column justify-content-around">
            <div class="p-4 input-section">
              <new-shift-input [disabled]="!!dispatcher" [dispatcher]="true" (dispatcherShiftCreated)="dispatcherShift = $event"> </new-shift-input>
              <new-shift-input
                (messengerShiftCreated)="messengerShifts.push($event)"
                #messengerInput
                [ignoredMessenger]="messengerToday.concat(dispatcherShift?.messenger)"
              >
              </new-shift-input>
            </div>

            <div class="overflow-y-scroll shifts-scroll" style="max-height: 60vh">
              <div *ngIf="dispatcherShift !== null || messengerShifts.length" class="shift-card pending-card mx-3 mt-3 mb-2">
                <div class="card-header pending-header">
                  <i class="bi bi-person-plus-fill"></i>
                  <span>zum einchecken</span>
                  <span class="badge">{{ (dispatcherShift ? 1 : 0) + messengerShifts.length }}</span>
                </div>
                <div class="card-body">
                  <shift
                    *ngFor="let shift of (dispatcherShift ? [dispatcherShift] : []).concat(messengerShifts)"
                    class="flex flex-row pt-3 align-items-center w-100 shift-row"
                    [shift]="shift"
                    (deleteFromCheckIn)="deleteFromCheckin($event)"
                  >
                  </shift>
                </div>
                <div class="card-action">
                  <button mat-raised-button class="fex-button checkin-btn" (click)="checkIn()" matDialogClose>
                    <div class="flex flex-row align-items-center"><i class="bi bi-box-arrow-in-right mr-2"></i>jetzt einchecken</div>
                  </button>
                </div>
              </div>

              <div *ngIf="openShiftsToday.length" class="shift-card active-card mx-3 mt-2 mb-2 pb-3">
                <div class="card-header active-header">
                  <i class="bi bi-bicycle"></i>
                  <span>eingecheckte kurier:innen</span>
                  <span class="badge badge-active">{{ openShiftsToday.length }}</span>
                </div>
                <div class="card-body" style="min-height: 100px">
                  <shift
                    *ngFor="let shift of openShiftsToday"
                    class="flex flex-row pt-3 align-items-center justify-content-between w-100 shift-row"
                    [shift]="shift"
                    (contextmenu)="onRightClick($event, shift)"
                  >
                  </shift>
                </div>
              </div>

              <div *ngIf="closedShiftsToday.length" class="shift-card closed-card mx-3 mt-2 mb-3">
                <div class="card-header closed-header">
                  <i class="bi bi-check2-all"></i>
                  <span>beendete schichten</span>
                  <span class="badge badge-closed">{{ closedShiftsToday.length }}</span>
                </div>
                <div class="card-body" style="min-height: 100px">
                  <shift
                    *ngFor="let shift of closedShiftsToday"
                    class="flex flex-row pt-3 align-items-center justify-content-between w-100 shift-row"
                    [shift]="shift"
                    (contextmenu)="onRightClick($event, shift)"
                  >
                  </shift>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mat-tab>
    </mat-tab-group>
    <div class="container">
      <div
        style="visibility: hidden; position: fixed"
        [style.left.px]="menuTopLeftPosition.x"
        [style.top.px]="menuTopLeftPosition.y"
        [matMenuTriggerFor]="rightMenu"
      ></div>
      <mat-menu #rightMenu="matMenu">
        <ng-template matMenuContent let-item="item">
          <right-click-menu [shift]="item"> </right-click-menu>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styles: [
    `
      @use '../../../const.scss' as *;

      * {
        display: flex;
        flex-direction: column;
      }

      #change-user-content {
        min-width: 300px;
      }

      /* Greeting */
      .dialog-greeting {
        max-width: 420px;
      }

      .greeting-main {
        color: $fex-dark;
        font-size: 20px;
        font-weight: 500;
        line-height: 1.2;
      }

      .greeting-sub {
        color: $accent;
        font-size: 14px;
        font-weight: 400;
        margin-top: 2px;
      }

      /* Input section */
      .input-section {
        border-bottom: 1px solid rgba(0, 0, 0, 0.07);
      }

      /* Scrollable shifts area */
      .shifts-scroll {
        background: #f5f4f8;
        padding-bottom: 8px;
      }

      /* Cards */
      .shift-card {
        background: white;
        border-radius: 8px;
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.09),
          0 1px 2px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .pending-card {
        border-left: 4px solid $fex-dark;
      }

      .active-card {
        border-left: 4px solid $accent;
      }

      .closed-card {
        border-left: 4px solid $gray;
        opacity: 0.78;
      }

      /* Card headers */
      .card-header {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.7px;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .pending-header {
        background: rgba(92, 56, 142, 0.05);
        color: $fex-dark;
      }

      .active-header {
        background: rgba(93, 195, 193, 0.08);
        color: $post-tour;
      }

      .closed-header {
        background: #f5f5f5;
        color: #aaa;
      }

      /* Count badges */
      .badge {
        margin-left: auto;
        background: $fex-dark;
        color: white;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 700;
        min-width: 20px;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }

      .badge-active {
        background: $accent;
      }

      .badge-closed {
        background: $gray;
      }

      /* Card body */
      .card-body {
        padding: 0 12px;
      }

      .shift-row {
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }

      .shift-row:last-child {
        border-bottom: none;
      }

      /* Check-in action footer */
      .card-action {
        flex-direction: row;
        padding: 12px 16px;
        background: rgba(92, 56, 142, 0.03);
        border-top: 1px solid rgba(92, 56, 142, 0.07);
      }

      .checkin-btn {
        flex-direction: row;
        align-items: center;
      }

      .svg {
        background-color: $fex-light !important;
      }
    `
  ],
  standalone: false
})
export class CheckInDialog implements AfterViewInit {
  dispatcherShift: Shift = null;
  messengerShifts: Shift[] = [];
  nextCheckout: Date;
  menuTopLeftPosition = { x: 0, y: 0 };

  get messengerToday() {
    return this.openShiftsToday.concat(this.messengerShifts).map((s) => s.messenger);
  }
  get openShiftsToday() {
    return GC.shiftsToday.filter((s) => !s.end);
  }
  get closedShiftsToday() {
    return GC.shiftsToday.filter((s) => s.end);
  }
  get dispatcher() {
    return GC.dispatcher();
  }

  @ViewChild('type') shiftType: MatSelect;
  @ViewChild('timepicker') timepicker: TimepickerComponent;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild('messengerInput') messengerInputComp: NewShiftComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      morning: boolean;
    }
  ) {
    this.nextCheckout = new Date().nextQuarter();
  }

  ngAfterViewInit(): void {
    if (this.dispatcher) {
      setTimeout(() => this.messengerInputComp.search.focus(), 200);
    }
  }

  ngOnInit(): void {
    GC.loadShiftsToday(GC.http);
  }

  checkIn(): void {
    let checkinShifts = this.messengerShifts.concat(this.dispatcherShift ? this.dispatcherShift : []);
    GC.setMessengerInShift(checkinShifts).subscribe(() => {
      GC.openSnackBarLong('kurier:innen eingecheckt!');
      setItem<Date>('date', new Date());
      GC.loadShiftsToday(GC.http);
      GC.messengersChanged.emit(true);
    });
  }

  deleteFromCheckin(shift: Shift) {
    if ([ShiftType.dispoEarly, ShiftType.dispoLate].includes(shift.type)) {
      this.dispatcherShift = null;
    } else {
      this.messengerShifts.splice(this.messengerShifts.indexOf(shift), 1);
      removeItem(shift.messenger.id);
    }
  }

  onRightClick(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX;
    this.menuTopLeftPosition.y = event.clientY;
    this.matMenuTrigger.menuData = { item: item };
    this.matMenuTrigger.openMenu();
  }
}
