import { Component, Inject, ViewChild } from '@angular/core';
import { removeItem, setItem } from '../../UTIL';
import { GC, ShiftType } from '../../common/GC';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimepickerComponent } from '../../views/timepicker.component';
import { MatSelect } from '@angular/material/select';
import { Shift } from '../../classes/Shift';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'change-user-dialog',
  template: `
    <mat-tab-group>
      <mat-tab label="kurier:innen ein- und auschecken">
        <h3 *ngIf="data?.morning" style="max-width: 400px;" class="pl-3">guten morgen! wer ist heute am start?</h3>
        <h3 *ngIf="!data?.morning" style="max-width: 400px;" class="pl-3">wer ist in der schicht?</h3>
        <div id="change-user-content" class="mt-2 justify-content-around" style="min-width: 400px">
          <div class="flex flex-column justify-content-around">
            <div class="p-4">
              <new-shift-input [disabled]="!!dispatcher" [dispatcher]="true" (dispatcherShiftCreated)="dispatcherShift = $event"> </new-shift-input>

              <new-shift-input (messengerShiftCreated)="messengerShifts.push($event)" #messengerInput [ignoredMessenger]="messengerToday"> </new-shift-input>
            </div>
            <div class="overflow-y-scroll" style="max-height: 60vh">
              <div *ngIf="dispatcherShift !== null || messengerShifts.length">
                <div class="mb-3 border-top border-bottom shiftBlock">
                  <h3 class="my-3">ausgewählte kurier:innen zum einchecken</h3>
                  <shift
                    *ngFor="let shift of (dispatcherShift ? [dispatcherShift] : []).concat(messengerShifts)"
                    class="flex flex-row pt-3 align-items-center w-100 border-bottom"
                    [shift]="shift"
                    (deleteFromCheckIn)="deleteFromCheckin($event)"
                  >
                  </shift>
                </div>

                <button mat-raised-button class="m-4 fex-button" (click)="checkIn()" matDialogClose>jetzt einchecken</button>
              </div>

              <div *ngIf="openShiftsToday.length" class="pb-3 border-top border-bottom shiftBlock">
                <h3 class="my-3">eingecheckte kurier:innen</h3>
                <div style="min-height: 100px">
                  <shift
                    *ngFor="let shift of openShiftsToday"
                    class="flex flex-row pt-3 align-items-center justify-content-between w-100 border-bottom"
                    [shift]="shift"
                    (contextmenu)="onRightClick($event, shift)"
                  >
                  </shift>
                </div>
              </div>

              <div *ngIf="closedShiftsToday.length" class="border-top border-bottom shiftBlock">
                <h3 class="my-3">beendete schichten</h3>
                <div style="min-height: 100px">
                  <shift
                    *ngFor="let shift of closedShiftsToday"
                    class="flex flex-row pt-3 align-items-center justify-content-between w-100 border-bottom"
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
      @import '../../../const.scss';

      * {
        display: flex;
        flex-direction: column;
      }

      #change-user-content {
        min-width: 300px;
      }

      h3 {
        color: $fex-dark;
        font-size: 18px;
      }

      .shiftBlock {
        background-color: #efefef;
        padding: 0 20px;
      }

      .svg {
        background-color: $fex-light !important;
      }
    `
  ]
})
export class CheckInDialog {
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

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      morning: boolean;
    }
  ) {
    this.nextCheckout = new Date().nextQuarter();
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
