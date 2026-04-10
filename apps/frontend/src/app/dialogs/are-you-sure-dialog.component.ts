import { Component, EventEmitter, HostListener, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Job } from '../classes/Job';
import { Messenger } from '../classes/Messenger';
import { TourplanItem } from '../classes/TourplanItem';

@Component({
  selector: 'app-are-you-sure-dialog',
  template: `
    <div class="dialog-wrap">
      <div *ngIf="data.warning" class="warning bar"><i class="bi bi-exclamation-triangle mr-2"></i> achtung</div>
      <div *ngIf="!data.warning" class="info bar"><i class="bi bi-info-circle mr-2"></i> hinweis</div>

      <div class="dialog-body p-4">
        <h3 class="headline" [innerHTML]="data.headline" style="white-space: nowrap;"></h3>
        <p *ngIf="data.text" class="subtext">{{ data.text }}</p>

        <description
          class="m-3"
          *ngIf="data.item"
          [hideTimeAlarms]="true"
          [item]="data.item"
          [headline]="true"
          [hideToolTips]="true"
          [hideHighlights]="true"
          matDialogClose
          [hideHints]="true"
        ></description>

        <searchinput
          *ngIf="data.messSearch"
          (resetted)="messenger = null"
          [keepMessName]="true"
          [searchMessenger]="true"
          (messengerSelected)="messenger = $event"
          [label]="'kurier:in'"
          class="mt-2"
        ></searchinput>
      </div>

      <div class="dialog-actions">
        <button
          #yes
          mat-flat-button
          class="action-btn mr-2"
          [class.primary-btn]="!data.highlightNo && !data.warning"
          [class.warn-btn]="data.warning"
          [class.cancel-btn]="data.highlightNo && !data.warning"
          [class.hidden-btn]="!data.verbYes"
          (click)="confirm.emit(messenger || true)"
          matDialogClose
        >
          {{ data.verbYes ? (messenger ? messenger?.nickname + ' festlegen' : data.verbYes) : 'ja' }}
        </button>
        <button *ngIf="data.verbThird" mat-stroked-button class="action-btn warn-btn mr-2" (click)="third.emit(true)" matDialogClose>
          {{ data.verbThird }}
        </button>
        <button
          #no
          mat-stroked-button
          class="action-btn"
          [class.primary-btn]="data.highlightNo"
          [class.cancel-btn]="!data.highlightNo"
          [class.hidden-btn]="!data.verbNo && !data.highlightNo"
          (click)="cancel.emit(true)"
          matDialogClose
        >
          {{ data.verbNo ? data.verbNo : 'abbrechen' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      @import '/src/const.scss';

      .dialog-wrap {
        display: flex;
        flex-direction: column;
        // max-width: 500px;
      }

      .bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: white;
        padding: 8px 20px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .warning {
        background: $warn;
      }

      .info {
        background: $fex-dark;
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        padding: 0px 24px;
      }

      .headline {
        font-weight: 500;
        line-height: 1.4;
        margin: 0 0 8px;
        // color: $fex-light;
      }

      .subtext {
        font-size: 14px;
        color: #555;
        margin: 0 0 8px;
      }

      .dialog-actions {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px 20px;
        gap: 6px;
      }

      .action-btn {
        font-size: 13px;
        letter-spacing: 0.02em;
        border-radius: 6px;
        padding: 0 16px;
        height: 36px;
      }

      .primary-btn {
        background: $fex-dark;
        color: white;
      }

      .warn-btn {
        background: $warn;
        color: white;
      }

      .cancel-btn {
        color: #444;
        border: 1px solid #ccc;
      }

      .hidden-btn {
        display: none;
      }
    `
  ]
})
export class AreYouSureDialogComponent {
  confirm = new EventEmitter<boolean | Messenger>();
  cancel = new EventEmitter<boolean>();
  third = new EventEmitter<boolean>();
  messenger: Messenger;

  @ViewChild('yes') yes: MatButton;
  @ViewChild('no') no: MatButton;

  @HostListener('keydown.enter')
  onEnter(): void {
    this.confirm.emit(this.messenger || true);
    this.dialogRef.close();
  }

  constructor(
    private dialogRef: MatDialogRef<AreYouSureDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      headline: string;
      text: string;
      verbYes: string;
      verbNo: string;
      verbThird?: string;
      highlightNo: boolean;
      item: TourplanItem;
      messSearch: boolean;
      warning: boolean;
    }
  ) {}
}
