import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InlineRangeCalendarComponent } from './inline-range-calendar.component';

describe('InlineRangeCalendarComponent', () => {
  let component: InlineRangeCalendarComponent;
  let fixture: ComponentFixture<InlineRangeCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InlineRangeCalendarComponent],
      imports: [NoopAnimationsModule, MatDatepickerModule, MatNativeDateModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InlineRangeCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
