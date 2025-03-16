import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsOverwiewComponent } from './shifts-overwiew.component';

describe('ShiftsOverwiewComponent', () => {
  let component: ShiftsOverwiewComponent;
  let fixture: ComponentFixture<ShiftsOverwiewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShiftsOverwiewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftsOverwiewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
