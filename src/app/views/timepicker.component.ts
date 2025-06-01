import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'timepicker',
  template: `
    <div class="align-items-center">
      <mat-form-field class="time">
        <mat-label>{{ this.label }}</mat-label>
        <input
          type="time"
          matInput
          [disabled]="disabled"
          [value]="timestamp(_time)"
          (change)="setTime(input.value)"
          (reset)="setTime('')"
          (keyup)="keys = keys + 1"
          [style.width.px]="width"
          tabindex="0"
          #input
        />
      </mat-form-field>
    </div>
  `,
  styles: [
    `
          .time {
            width: 105%;
          }
        `
  ]
})
export class TimepickerComponent implements OnInit {
  @ViewChild('time') timePicker: MatInput;
  @Input() time: Date;
  @Input() label: String;
  @Input() disabled: boolean;
  @Input() noDate: boolean;
  @Input() disableAutoReplace: boolean;
  @Input() compareDate: Date;
  @Input() width: number;
  @Output() timeChange = new EventEmitter<Date>();
  @Output() timeChangeDebounce = new EventEmitter<Date>();
  _time: Date;
  today = this.dateAdapter.today();
  keys = 0;

  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit(): void {
    this._time = this.time;
    this.timeChange.pipe(debounceTime(1000)).subscribe((date) => this.timeChangeDebounce.emit(date));
  }

  onTimeUpdate(event: Event): void {
    const input = event.target as HTMLInputElement;

    // this.setTime(input.value, 'timeupdate');
  }

  setTime(s: string): void {
    if (!s || s === '') {
      if (!this.disableAutoReplace) {
        this.timeChange.emit(this._time);
        return;
      }
      this._time.setHours(this.today.getHours());
      this._time.setMinutes(this.today.getMinutes());
    } else {
      const h = s.slice(0, 2);
      const m = s.slice(3, 5);
      this._time = new Date(this._time);
      this._time.setHours(parseInt(h));
      this._time.setMinutes(parseInt(m));
    }
    this.timeChange.emit(this._time);
  }

  timestamp(date: Date): string {
    return TimepickerComponent.timestampStatic(date);
  }

  static timestampStatic(date: Date): string {
    if (date === null) {
      return '--:--';
    }
    date = new Date(date);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  makeFiveHoursShift(date: Date): void {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 5);

    // Cap at 18:00:00
    if (newDate.getHours() > 18 || (newDate.getHours() === 18 && (newDate.getMinutes() > 0 || newDate.getSeconds() > 0))) {
      newDate.setHours(18, 0, 0, 0);
    }

    this.setTime(this.timestamp(newDate));
  }
}
