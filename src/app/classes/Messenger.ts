import { removeItem, setItem } from '../UTIL';
import { GC, ShiftType } from '../common/GC';
import { Shift } from './Shift';
import { CheckoutDialogComponent } from '../dialogs/checkout-dialog.component';
import { AreYouSureDialogComponent } from '../dialogs/are-you-sure-dialog.component';
import { IdObject } from '../common/interfaces';
import { MessengerDialogComponent } from '../dialogs/messenger-dialog.component';
import { map, Observable } from 'rxjs';

export class Messenger implements IdObject {
  // db fields
  id: string; // dbid
  messengerId: string; // fexid
  nickname: string;
  firstName: string;
  lastName: string;
  dispatcher = false;
  active = true;
  telNumber: string;

  // runtime variables
  /**
   * telephone number to show on tourplan
   * (supposed to be between 1-9)
   */
  fexNumber: number;
  /**
   * @param date the date to get the sales for
   * @returns a quadruple of prices representing the sum value of all jobs done in this shift by this messenger
   */
  sales = (date: Date) => {
    return GC.messengerData(date).get(this.id)?.sales;
  };
  /**
   * @param date the date to get the jobs for
   * @returns a list of all jobs done by this messenger at the given date
   */
  jobs = (date: Date) => {
    return GC.messengerData(date).get(this.id)?.jobs;
  };
  /**
   * reference to a shift, the messenger is in right now
   */
  shift: Shift;
  /**
   * reference to a list of shifts for a month
   */
  shifts: Shift[] = [];
  shiftsWithoutEnd = 0;
  hours = 0;
  editDist: number = null;

  constructor(data?: Partial<Messenger>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  set _fexNumber(number: number) {
    if (!number) {
      removeItem(this.id);
      this.fexNumber = null;
      GC.openSnackBarShort(`nummer von ${this.nickname} gelöscht`);
      return;
    }
    if (this.fexNumber === number) {
      return;
    }
    this.fexNumber = number;
    setItem<{ number: number; date: Date }>(this.id, { number: number, date: new Date() });
    GC.openSnackBarShort(`${this.nickname} hat die ${number}`);
  }

  checkout(end: Date): void {
    if (!this.shift || !end) {
      return;
    }
    if ([ShiftType.dispoEarly, ShiftType.dispoLate].includes(this.shift.type)) {
      this.shift.update(`${this.shift.messenger.nickname} wurde ausgecheckt`, true).subscribe((s) => {
        this.shift = s;
        GC.loadShiftsToday(GC.http);
      });
    } else {
      const dialog = GC.dialog.open(CheckoutDialogComponent, {
        data: {
          shift: this.shift,
          jobs: this.jobs(this.shift.start) || []
        }
      });
      dialog.componentInstance.dialogRef = dialog;
    }
  }

  copy(): Messenger {
    const m = new Messenger(this);
    m.shift = null;
    m.shifts = null;
    return m;
  }

  delete(): void {
    const dialog = GC.dialog.open(AreYouSureDialogComponent, {
      data: {
        headline: 'möchtest du diese kurier:in wirklich löschen?',
        verbYes: 'ja',
        verbNo: 'nein',
        highlightNo: true,
        warning: true
      }
    });
    dialog.componentInstance.confirm.subscribe(() => {
      GC.http.deleteMessenger(this).subscribe(() => {
        GC.openSnackBarLong('kurier:in gelöscht');
      });
    });
  }

  toggleActivate(): void {
    this.active = !this.active;
    GC.http.updateMessenger(this).subscribe(() => {
      GC.openSnackBarLong('kurier:in ' + (this.active ? 'aktiviert' : 'deaktiviert'));
    });
  }

  openDialog(openShifts?: boolean): void {
    GC.http.getShiftsForMessengerAndMonth(this, new Date()).subscribe((shifts) => {
      GC.dialog.open(MessengerDialogComponent, {
        data: {
          messenger: this,
          shifts: shifts,
          selectedIndex: openShifts ? 1 : 0
        }
      });
    });
  }

  loadShifts(month?: Date): Observable<Shift[]> {
    month = month ? month : new Date();
    let os = GC.http.getShiftsForMessengerAndMonth(this, month).pipe(
      map((list) => {
        list.sort((a, b) => {
          return a.start.getTime() - b.start.getTime();
        });
        this.shifts = list;
        this._calcHours();
        return list;
      })
    );
    return os;
  }

  _calcHours(): void {
    let result = Messenger.calcHours(this.shifts);
    this.hours = result.hours;
    this.shiftsWithoutEnd = result.shiftsWithoutEnd;
  }

  static calcHours(shifts: Shift[]): { hours: number; shiftsWithoutEnd: number } {
    let hours = 0;
    let shiftsWithoutEnd = 0;
    shifts.forEach((shift) => {
      if (shift.end) {
        hours += shift.start.hoursDifference(shift.end);
      } else {
        shiftsWithoutEnd++;
      }
    });
    return { hours: hours, shiftsWithoutEnd: shiftsWithoutEnd };
  }
}
