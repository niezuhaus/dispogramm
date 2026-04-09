import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Zone } from '../classes/Zone';
import { GC } from '../common/GC';
import { LngLatBoundsLike, Map } from 'mapbox-gl';
import { initMap } from '../UTIL';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import { bbox, Feature, MultiPolygon, polygon, Polygon, union } from '@turf/turf';
import { ErrorStateMatcher } from '@angular/material/core';
import { SaveAttemptErrorStateMatcher } from '../common/save-attempt-error-state-matcher';

@Component({
  selector: 'app-zone-dialog',
  template: `
    <div [appShakeOnInvalidSubmit]="saveAttemptCount" [appShakeInvalid]="!canSave()">
      <mat-tab-group dynamicHeight class="animated-width">
        <mat-tab label="zone speichern">
          <div class="pb-4 px-4" style="width: 75vw">
            <div class="flex flex-row justify-content-between align-items-baseline">
              <div class="flex flex-row align-items-center">
                <mat-form-field>
                  <mat-label>name</mat-label>
                  <input [(ngModel)]="zone.name" matInput type="text" required [errorStateMatcher]="saveAttemptMatcher" #nameModel="ngModel" />
                  <mat-error *ngIf="nameModel.hasError('required')">feld darf nicht leer sein</mat-error>
                </mat-form-field>
                <app-price-input class="ml-3" [(price)]="zone.price" [label]="'preis pro stop'" [width]="80" [type]="0"></app-price-input>
                <mat-checkbox class="ml-3" [(ngModel)]="zone.exclusive">preis außerhalb der zone anwenden</mat-checkbox>
              </div>

              <div>{{ zone.nrOfPoints }} punkte, {{ zone.area }}km²</div>
            </div>

            <div id="mapcontainer">
              <div #map id="map"></div>
            </div>

            <div class="flex flex-column">
              <button #yes mat-raised-button class="mt-4 fex-button" (click)="onSaveClicked()">speichern</button>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      #mapcontainer {
        position: relative;
        width: 100%;
        max-height: 60vh;
      }

      #map {
        height: 60vh;
      }
    `
  ]
})
export class ZoneDialogComponent implements OnInit, AfterViewInit {
  confirm = new EventEmitter<Zone>();
  mapGL: Map;
  mapboxDraw: MapboxDraw;
  zone: Zone;
  polygonIds: string[] = [];
  saveAttempted = false;
  saveAttemptCount = 0;
  saveAttemptMatcher: ErrorStateMatcher;

  @ViewChild('map') mapContainer: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      zone: Zone;
    }
  ) {
    this.saveAttemptMatcher = new SaveAttemptErrorStateMatcher(() => this.saveAttempted);
    this.zone = data.zone ? new Zone(data.zone) : new Zone();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.mapGL = initMap({
      lnglat: GC.INIT_MAPCENTER,
      zoom: GC.INIT_ZOOM,
      container: 'map'
    });

    this.mapboxDraw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    this.mapGL.addControl(this.mapboxDraw);

    if (this.zone.id && this.zone.polygon) {
      this.mapGL
        .on('load', () => {
          this.addToMap(this.zone.polygon);
        })
        .fitBounds(bbox(this.zone.polygon) as LngLatBoundsLike, {
          padding: { left: 50, top: 50, right: 50, bottom: 50 }
        });
    }

    this.mapGL.on('draw.update', (e: { features: Feature<Polygon>[] }) => {
      this.zone._coordinates = e.features[0].geometry.coordinates[0];
    });

    this.mapGL.on('draw.create', (e: { features: Feature<Polygon>[] }) => {
      this.zone._coordinates = e.features[0].geometry.coordinates[0];
    });

    this.mapGL.on('draw.delete', (e: Feature<Polygon>[]) => {
      this.zone._coordinates = (this.mapboxDraw.getAll().features as Feature<Polygon>[]).map((f) => f.geometry.coordinates[0])[0];
    });
  }

  addToMap(polygon: Feature<Polygon | MultiPolygon>) {
    this.zone.polygon = union(this.zone.polygon, polygon);
    this.mapboxDraw.deleteAll();
    this.mapboxDraw.add(this.zone.polygon);
  }

  canSave(): boolean {
    return !!(this.zone.name || '').trim();
  }

  onSaveClicked(): void {
    this.saveAttempted = true;
    this.saveAttemptCount += 1;
    if (!this.canSave()) return;
    this.saveZone();
  }

  saveZone(): void {
    if (this.zone.id) {
      GC.http.updateZone(this.zone).subscribe(() => {
        GC.openSnackBarLong('zone gespeichert');
        this.confirm.emit(this.zone);
        GC.dialog.closeAll();
      });
    } else {
      GC.http.createZone(this.zone).subscribe(() => {
        GC.openSnackBarLong('zone gespeichert');
        this.confirm.emit(this.zone);
        GC.dialog.closeAll();
      });
    }
  }
}
