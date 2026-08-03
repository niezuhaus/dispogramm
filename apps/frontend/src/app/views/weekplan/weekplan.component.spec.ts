import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { WeekplanComponent } from './weekplan.component';
import { BikeComponent } from '../bike.component';

describe('WeekplanComponent', () => {
  let component: WeekplanComponent;
  let fixture: ComponentFixture<WeekplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeekplanComponent, BikeComponent],
      imports: [NoopAnimationsModule, MatMenuModule, MatTableModule, MatButtonModule, MatFormFieldModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(WeekplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
