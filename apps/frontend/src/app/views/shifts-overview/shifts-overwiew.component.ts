import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TitleComponent } from '../app.component';
import { GC } from 'src/app/common/GC';
import { Messenger } from 'src/app/classes/Messenger';
import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShiftTableComponent } from '../shift-table.component';
import { ActivatedRoute } from '@angular/router';
import { Shift } from 'src/app/classes/Shift';
import { ConfigDialogComponent } from 'src/app/dialogs/config-dialog.component';

@Component({
  selector: 'app-shifts-overwiew',
  template: `
    <div class="h-100">
      <div class="flex w-100 pt-3 p-4 flex-column justify-content-between top-bar" style="background-color: white; z-index: 1;">
        <div class="flex flex-row w-100 align-items-center mb-3">
          <datepicker [(date)]="date" [monthly]="true" (dateChange)="monthChanged($event)" #datepicker></datepicker>
          <mat-checkbox [checked]="hideShiftless()" (change)="toggleFilter()">
            <span style="font-size: 16px;"> nur kurier:innen mit schicht</span>
          </mat-checkbox>
          <span class="ml-4 wage-info">mindestlohn: {{ minimumWage() }}€/stunde</span>
          <a class="ml-2 change-link" (click)="openConfig()">ändern</a>
        </div>
        <div *ngIf="shiftsLoaded">
          <div class="summary-bar mx-3 mb-3">
            <div class="stat-chip">
              <span class="stat-val">{{ allShifts.length }}</span>
              <span class="stat-label">schichten im {{ months()[date.getMonth()] }} {{ date.getFullYear() }}</span>
            </div>
            <div class="stat-chip">
              <span class="stat-val">{{ allHours }}h</span>
              <span class="stat-label">{{ (allHours * minimumWage()).round(2) }}€ gesamt</span>
            </div>
            <div class="warn-chip" *ngIf="shiftsWithoutEnd > 0">
              <i class="bi bi-exclamation-triangle mr-2"></i>{{ shiftsWithoutEnd }} schichten ohne endzeit
            </div>
          </div>
          <div id="panelContainer">
            <div *ngFor="let m of hideShiftless() ? filteredMessenger : messengers; let i = index"
                 class="messengerPanel" [class.has-shifts]="m.shifts.length">
              <div [style.opacity]="m.shifts.length ? 1 : 0.35" class="messengerContent">
                <div class="panel-header">
                  <div>
                    <a class="messenger-name" (click)="m.openDialog(true)">
                      {{ !m.lastName ? '(kein nachname)' : m.lastName }},
                      {{ !m.firstName ? 'vornamen eintragen' : m.firstName }}
                    </a>
                    <span class="messenger-nickname">{{ m.nickname }}</span>
                  </div>
                  <div class="panel-stats">
                    <span class="stat-pill">{{ m.shifts?.length }} schichten</span>
                    <span class="stat-pill hours-pill" *ngIf="m.shifts?.length">{{ m.hours }}h · {{ (m.hours * minimumWage()).round(2) }}€</span>
                    <span class="warn-pill" *ngIf="m.shiftsWithoutEnd > 0">
                      <i class="bi bi-exclamation-triangle"></i> {{ m.shiftsWithoutEnd }} ohne endzeit
                    </span>
                  </div>
                </div>
                <shift-table #table [messenger]="m" (shiftUpdated)="m._calcHours()" class="w-100"></shift-table>
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
        </div>
        <div *ngIf="!shiftsLoaded" style="height: 90vh !important;" class="flex w-100 h-100 align-items-center justify-content-center">
          <bike style="margin: auto"></bike>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'src/const.scss' as *;

      /* Top toolbar */
      .top-bar {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      }

      .wage-info {
        color: #888;
        font-size: 13px;
      }

      .change-link {
        color: $fex-light;
        font-size: 13px;
        cursor: pointer;
      }

      /* Summary stat chips */
      .summary-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .stat-chip {
        display: flex;
        flex-direction: column;
        background: rgba(92, 56, 142, 0.05);
        border: 1px solid rgba(92, 56, 142, 0.12);
        border-radius: 8px;
        padding: 6px 16px;
      }

      .stat-val {
        font-size: 20px;
        font-weight: 600;
        color: $fex-dark;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 11px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }

      .warn-chip {
        display: flex;
        flex-direction: row;
        align-items: center;
        background: rgba(185, 18, 27, 0.08);
        color: $warn;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 13px;
        font-weight: 500;
      }

      /* Messenger panel grid */
      #panelContainer {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(750px, 1fr));
        gap: 20px;
        padding-bottom: 24px;
      }

      .messengerPanel {
        position: relative;
        min-width: 750px;
        box-sizing: border-box;
        background: white;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
        overflow: hidden;
        padding-bottom: 60px;
      }

      .messengerPanel.has-shifts {
        border-left: 4px solid $fex-dark;
      }

      .messengerContent {
        padding: 16px 20px 12px;
      }

      /* Panel header: name + stats side by side */
      .panel-header {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 12px;
        gap: 16px;
      }

      .messenger-name {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: $fex-dark;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
      }

      .messenger-name:hover {
        color: $fex-light;
      }

      .messenger-nickname {
        display: block;
        font-size: 13px;
        font-style: italic;
        color: #999;
        margin-top: 2px;
      }

      .panel-stats {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .stat-pill {
        background: rgba(92, 56, 142, 0.07);
        color: $fex-dark;
        border-radius: 10px;
        padding: 3px 10px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      .hours-pill {
        background: rgba(93, 195, 193, 0.1);
        color: $post-tour;
      }

      .warn-pill {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        background: rgba(185, 18, 27, 0.08);
        color: $warn;
        border-radius: 10px;
        padding: 3px 10px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      /* Button footer */
      .buttonContainer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        padding: 10px 16px;
        background: rgba(92, 56, 142, 0.03);
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .buttonContainer > * {
        margin-right: 12px;
      }
    `
  ],
  standalone: false
})
export class ShiftsOverwiewComponent extends TitleComponent implements OnInit, AfterViewInit, OnDestroy {
  override title = 'schichten';
  private destroy$ = new Subject<void>();
  shiftsLoaded = false;
  allShifts: Shift[] = [];
  get allHours(): number {
    return this.filteredMessenger.reduce((sum, messenger) => sum + messenger.hours, 0).round(2);
  }
  get shiftsWithoutEnd(): number {
    return this.filteredMessenger.reduce((acc, messenger) => acc + messenger.shiftsWithoutEnd, 0);
  }
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params.get('month')) {
        this.date.setDateByString(params.get('month') + '-01');
      } else {
        GC.location.replaceState(`${GC.routes.shifts}`, `month=${this.date.yyyymm()}`);
      }
    });
  }

  ngAfterViewInit(): void {
    GC.loaded().pipe(takeUntil(this.destroy$)).subscribe(() => {
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
    zip(this.messengers.map((m) => m.loadShifts(this.date))).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.allShifts = res.reduce((acc, shiftArr) => acc.concat(shiftArr), []);
      const shiftsByDate: { [key: string]: Shift[] } = {};
      this.allShifts.forEach((shift) => {
        const dateKey = shift.start.toISOString().split('T')[0];
        shiftsByDate[dateKey] = shiftsByDate[dateKey] || [];
        shiftsByDate[dateKey].push(shift);
      });
      this.filteredMessenger = this.messengers.filter((m, i) => res[i].length);
      this.shiftsLoaded = true;
      this.cd.detectChanges();
    });
  }

  monthChanged(month: Date): void {
    this.load();
    GC.location.replaceState(`${GC.routes.shifts}`, `month=${this.date.yyyymm()}`);
  }

  toggleFilter(): void {
    GC.config.shifts.hideShiftless = !this.hideShiftless();
    GC.http.saveConfigItem('hideShiftless', GC.config.shifts.hideShiftless.toString()).subscribe(() => {
      GC.openSnackBarShort(`kurier:innen ohne schicht ${GC.config.shifts.hideShiftless ? 'ausgeblendet' : 'eingeblendet'}`);
    });
  }
}
