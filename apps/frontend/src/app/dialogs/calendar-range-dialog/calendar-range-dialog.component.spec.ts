import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CalendarRangeDialogComponent } from './calendar-range-dialog.component';
import { InlineRangeCalendarComponent } from './inline-range-calendar/inline-range-calendar.component';

describe('CalendarRangeDialogComponent', () => {
  let component: CalendarRangeDialogComponent;
  let fixture: ComponentFixture<CalendarRangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarRangeDialogComponent, InlineRangeCalendarComponent],
      imports: [NoopAnimationsModule, MatDialogModule, MatTabsModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { headline: 'test', onlyDatePicker: false, regularJob: undefined }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarRangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
