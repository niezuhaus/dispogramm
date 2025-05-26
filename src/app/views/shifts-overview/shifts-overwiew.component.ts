import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TitleComponent } from '../app.component';
import { GC } from 'src/app/common/GC';
import { Messenger } from 'src/app/classes/Messenger';
import { zip } from 'rxjs';
import { ShiftTableComponent } from '../shift-table.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shifts-overwiew',
  template: `
    <div class="h-100">
      <div class="flex w-100 pt-3 p-4 flex-column justify-content-between" style="background-color: white; z-index: 1;">
        <div class="flex flex-row w-100 align-items-center mb-3">
          <datepicker [(date)]="date" [monthly]="true" (dateChange)="monthChanged($event)" #datepicker> </datepicker>
          <mat-checkbox [checked]="hideShiftless()" (change)="toggleFilter()"> nur kurier:innen mit schicht </mat-checkbox>
        </div>
        <div *ngIf="shiftsLoaded">
          <div *ngFor="let m of hideShiftless() ? filteredMessenger : messengers; let i = index">
            <div [style.opacity]="m.shifts.length ? 1 : 0.25">
              <h3 style="cursor: pointer; white-space: nowrap; margin: 0">
                <a (click)="m.openDialog(true)">
                  {{ !m.lastName ? '(kein nachname)' : m.lastName }},
                  {{ !m.firstName ? 'vornamen eintragen' : m.firstName }}
                </a>
              </h3>
              <h5 style="font-style: italic;">
                {{ m.nickname }}
              </h5>
              <h6>{{ m.shifts?.length }} schicht(en) im {{ months()[date.getMonth()] }} {{ date.getFullYear() }}</h6>
              <h6 *ngIf="m.shifts?.length">insgesamt {{ m.hours }} stunden ({{ (m.hours * minimumWage()).round(2) }}€)</h6>
              <shift-table #table [messenger]="m" [onShiftDelete]="load.bind(this)" (shiftUpdated)="m._calcHours()"> </shift-table>
              <button mat-raised-button class="fex-button mt-4" (click)="tables.get(i).newShift()" matTooltip="neue schicht hinzufügen">
                schicht hinzufügen
                <i class="ml-3 bi bi-plus-circle"></i>
              </button>
            </div>
            <hr />
          </div>
        </div>
        <div *ngIf="!shiftsLoaded" style="height: 90vh !important;" class="flex w-100 h-100 align-items-center justify-content-center">
          <bike style="margin: auto"></bike>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./shifts-overwiew.component.scss']
})
export class ShiftsOverwiewComponent extends TitleComponent implements OnInit, AfterViewInit {
  override title = 'schichten';
  shiftsLoaded = false;
  date = new Date();
  hideShiftless = () => {
    return GC.config?.shifts.hideShiftless;
  };
  messengers: Messenger[] = [];
  filteredMessenger: Messenger[] = [];

  months = () => {
    return GC.monthLiterals;
  };

  minimumWage = () => {
    return GC.config.minimumWage;
  };

  // Use ViewChildren to get all ShiftTableComponent instances
  @ViewChild('datepicker') datepicker: any;
  @ViewChildren('table') tables: QueryList<ShiftTableComponent>;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (params.get('month')) {
        this.date.setDateByString(params.get('month') + '-01');
      } else {
        GC.location.replaceState(`${GC.routes.shifts};month=${this.date.yyyymm()}`);
      }
    });
  }

  ngAfterViewInit(): void {
    GC.loaded().subscribe(() => {
      this.messengers = GC.messengers.sort((a, b) => {
        switch (true) {
          case !a.lastName && !b.lastName:
            return 0;

          case !a.lastName:
            return 1;

          case !b.lastName:
            return -1;
        }

        return a.lastName.localeCompare(b.lastName);
      });

      this.load();
    });
  }

  load(): void {
    console.log('now');

    this.shiftsLoaded = false;
    zip(this.messengers.map((m) => m.loadShifts(this.date))).subscribe((res) => {
      this.filteredMessenger = this.messengers.filter((m, i) => res[i].length);
      this.shiftsLoaded = true;
      this.cd.detectChanges();
    });
  }

  monthChanged(month: Date): void {
    this.load();
    GC.location.replaceState(`${GC.routes.shifts};month=${this.date.yyyymm()}`);
  }

  toggleFilter(): void {
    GC.config.shifts.hideShiftless = !this.hideShiftless();
    GC.http.saveConfigItem('hideShiftless', GC.config.shifts.hideShiftless.toString()).subscribe(() => {
      GC.openSnackBarShort(`kurier:innen ohne schicht ${GC.config.shifts.hideShiftless ? 'ausgeblendet' : 'eingeblendet'}`);
    });
  }
}
