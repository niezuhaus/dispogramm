import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TitleComponent } from '../app.component';
import { GC } from 'src/app/common/GC';
import { Messenger } from 'src/app/classes/Messenger';
import { zip } from 'rxjs';
import { ShiftTableComponent } from '../shift-table.component';
import { ActivatedRoute } from '@angular/router';
import { Shift } from 'src/app/classes/Shift';
import { ConfigDialogComponent } from 'src/app/dialogs/config-dialog.component';

@Component({
  selector: 'app-shifts-overwiew',
  template: `
    <div class="h-100">
      <div class="flex w-100 pt-3 p-4 flex-column justify-content-between" style="background-color: white; z-index: 1;">
        <div class="flex flex-row w-100 align-items-center mb-3">
          <datepicker [(date)]="date" [monthly]="true" (dateChange)="monthChanged($event)" #datepicker></datepicker>
          <mat-checkbox [checked]="hideShiftless()" (change)="toggleFilter()"> nur kurier:innen mit schicht </mat-checkbox>
          <span class="ml-4">mindestlohn: {{ minimumWage() }}€/stunde</span>
          <a class="ml-4" (click)="openConfig()">ändern</a>
        </div>
        <div *ngIf="shiftsLoaded" id="list">
          <div *ngFor="let m of hideShiftless() ? filteredMessenger : messengers; let i = index" class="messengerPanel">
            <div [style.opacity]="m.shifts.length ? 1 : 0.25" class="messengerContent">
              <h3 style="cursor: pointer; white-space: nowrap; margin: 0">
                <a (click)="m.openDialog(true)">
                  {{ !m.lastName ? '(kein nachname)' : m.lastName }},
                  {{ !m.firstName ? 'vornamen eintragen' : m.firstName }}
                </a>
              </h3>
              <h5 style="font-style: italic;">{{ m.nickname }}</h5>
              <h6>{{ m.shifts?.length }} schicht(en) im {{ months()[date.getMonth()] }} {{ date.getFullYear() }}</h6>
              <h6 *ngIf="m.shifts?.length">insgesamt {{ m.hours }} stunden ({{ (m.hours * minimumWage()).round(2) }}€)</h6>
              <shift-table #table [messenger]="m" (shiftUpdated)="m._calcHours()"></shift-table>
            </div>
            <div class="buttonContainer">
              <button mat-raised-button class="fex-unimportant-button" (click)="tables.get(i).newShift()" matTooltip="neue schicht hinzufügen">
                schicht hinzufügen
                <i class="ml-3 bi bi-plus-circle"></i>
              </button>
              <button mat-raised-button class="fex-unimportant-button" (click)="tables.get(i).newShift(null, 6)" matTooltip="neue friki-schicht hinzufügen">
                friki
                <i class="ml-3 bi bi-plus-circle"></i>
              </button>
              <button mat-raised-button class="fex-unimportant-button" (click)="tables.get(i).newShift(null, 7)" matTooltip="neue ag-schicht hinzufügen">
                ag zeit
                <i class="ml-3 bi bi-plus-circle"></i>
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="!shiftsLoaded" style="height: 90vh !important;" class="flex w-100 h-100 align-items-center justify-content-center">
          <bike style="margin: auto"></bike>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Container spans full width and distributes extra space between items */
      #list {
        display: flex;
        flex-wrap: wrap;
        // justify-content: space-between;
      }
      /* Messenger panels use only the needed space, fixed to a minimum (and maximum) width */
      .messengerPanel {
        position: relative;
        min-width: 450px;
        box-sizing: border-box;
        flex: 0 1 auto;
        margin: 20px 20px 0 0;
        padding: 10px 20px 60px 10px;
        border: 1.2pt dashed #c7c7c7;
      }
      .buttonContainer {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        display: flex;
      }
      .buttonContainer > * {
        margin-right: 20px;
      }
    `
  ]
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
    return GC.config?.minimumWage;
  };

  openConfig = () => {
    GC.dialog.open(ConfigDialogComponent, { data: { pageIndex: 2 } });
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
