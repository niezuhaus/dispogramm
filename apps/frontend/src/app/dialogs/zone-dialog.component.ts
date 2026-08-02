import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Zone } from '../classes/Zone';
import { GC } from '../common/GC';
import { LngLatBoundsLike, Map } from 'maplibre-gl';
import { initMap } from '../UTIL';
import { GeoJSONStoreFeatures, TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode } from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import { bbox, Feature, MultiPolygon, Polygon, Position } from '@turf/turf';
import { ErrorStateMatcher } from '@angular/material/core';
import { SaveAttemptErrorStateMatcher } from '../common/save-attempt-error-state-matcher';

/**
 * mirrors how a zone is painted in the newtour map (see `toggleObject` there), so a zone looks the
 * same while it is being edited here as it does on the tour map afterwards.
 */
const ZONE_FILL_COLOR = '#000000';
const ZONE_FILL_OPACITY = 0.08;
const ZONE_OUTLINE_COLOR = '#000000';
const ZONE_OUTLINE_OPACITY = 0.4;
const ZONE_OUTLINE_WIDTH = 2;
/** newtour has no editing handles to copy, so they take the brand colour ($fex-dark) instead */
const HANDLE_COLOR = '#5c388e';

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
              <!-- id must stay unique in the document: newtour's map container is the one called "map" -->
              <div #map id="zoneMap"></div>
              <!-- terra-draw ships no controls of its own, so the draw/delete buttons live here -->
              <div class="draw-controls">
                <button mat-mini-fab class="draw-button" matTooltip="zone zeichnen" (click)="drawPolygon()">
                  <i class="bi bi-pentagon"></i>
                </button>
                <button mat-mini-fab class="draw-button" matTooltip="zone löschen" [disabled]="!zone.polygon" (click)="deletePolygon()">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
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
      @import 'src/const.scss';

      #mapcontainer {
        position: relative;
        width: 100%;
        max-height: 60vh;
      }

      #zoneMap {
        height: 60vh;
      }

      .draw-controls {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .draw-button:not([disabled]) {
        background-color: $fex-dark;
        color: white;
      }
    `
  ],
  standalone: false
})
export class ZoneDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  confirm = new EventEmitter<Zone>();
  mapGL: Map;
  terraDraw: TerraDraw;
  zone: Zone;
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

  ngOnDestroy(): void {
    this.terraDraw?.stop();
    this.mapGL?.remove();
  }

  ngAfterViewInit(): void {
    this.mapGL = initMap({
      lnglat: GC.INIT_MAPCENTER,
      zoom: GC.INIT_ZOOM,
      container: this.mapContainer.nativeElement
    });

    this.terraDraw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map: this.mapGL }),
      modes: [
        new TerraDrawPolygonMode({
          styles: {
            fillColor: ZONE_FILL_COLOR,
            fillOpacity: ZONE_FILL_OPACITY,
            outlineColor: ZONE_OUTLINE_COLOR,
            outlineOpacity: ZONE_OUTLINE_OPACITY,
            outlineWidth: ZONE_OUTLINE_WIDTH,
            closingPointColor: HANDLE_COLOR,
            closingPointOutlineColor: '#ffffff'
          }
        }),
        // the flags spell out what mapbox-gl-draw allowed implicitly: move the zone as a whole,
        // drag its corners, add one via the midpoints and remove one again.
        new TerraDrawSelectMode({
          flags: {
            polygon: {
              feature: {
                draggable: true,
                coordinates: { midpoints: true, draggable: true, deletable: true }
              }
            }
          },
          styles: {
            selectedPolygonColor: ZONE_FILL_COLOR,
            selectedPolygonFillOpacity: ZONE_FILL_OPACITY,
            selectedPolygonOutlineColor: ZONE_OUTLINE_COLOR,
            selectedPolygonOutlineOpacity: ZONE_OUTLINE_OPACITY,
            selectedPolygonOutlineWidth: ZONE_OUTLINE_WIDTH,
            // corner handles: solid, midpoints (add-a-corner) faded, so the two read apart
            selectionPointColor: HANDLE_COLOR,
            selectionPointOutlineColor: '#ffffff',
            selectionPointWidth: 6,
            selectionPointOutlineWidth: 2,
            midPointColor: HANDLE_COLOR,
            midPointOutlineColor: '#ffffff',
            midPointOpacity: 0.5,
            midPointWidth: 4,
            midPointOutlineWidth: 1
          }
        })
      ]
    });

    this.terraDraw.on('finish', (id) => {
      // a zone owns exactly one polygon, so a freshly drawn one replaces whatever was there
      const stale = this.terraDraw
        .getSnapshot()
        .filter((f) => f.id !== id && f.properties?.['mode'] === 'polygon')
        .map((f) => f.id);
      if (stale.length) {
        this.terraDraw.removeFeatures(stale);
      }
      this.readCoordinates([id]);
      // terra-draw stays in the mode it was set to; dropping back to selection is what makes the
      // polygon editable right after drawing it, the way mapbox-gl-draw behaved.
      this.terraDraw.setMode('select');
    });

    this.terraDraw.on('change', (ids, type) => {
      if (type === 'update') {
        this.readCoordinates(ids);
      }
    });

    this.mapGL.on('load', () => {
      // the adapter registers its own sources and layers on start, so the style has to be up
      // first — and start() has to precede any addFeatures() call.
      this.terraDraw.start();
      this.terraDraw.setMode('select');
      if (this.zone.id && this.zone.polygon) {
        this.addToMap(this.zone.polygon);
      }
    });

    if (this.zone.id && this.zone.polygon) {
      this.mapGL.fitBounds(bbox(this.zone.polygon) as LngLatBoundsLike, {
        padding: { left: 50, top: 50, right: 50, bottom: 50 }
      });
    }
  }

  /** puts the map into drawing mode — the drawn polygon replaces the current one when finished */
  drawPolygon(): void {
    this.terraDraw.setMode('polygon');
  }

  deletePolygon(): void {
    this.terraDraw.clear();
    this.terraDraw.setMode('select');
    // the setter clears `coordinates` too; assigning an empty ring would throw in turf's polygon()
    this.zone.polygon = null;
  }

  /**
   * loads the zone's saved polygon into the draw layer. terra-draw needs an id and a
   * properties.mode naming a registered mode on every feature handed to it — 'polygon' is what
   * ties the feature to the select mode's flags above.
   */
  addToMap(feature: Feature<Polygon | MultiPolygon>): void {
    if (feature.geometry.type !== 'Polygon') {
      return;
    }
    this.terraDraw.clear();
    this.terraDraw.addFeatures([{ ...feature, id: this.terraDraw.getFeatureId(), properties: { mode: 'polygon' } } as GeoJSONStoreFeatures]);
  }

  /**
   * select mode reports its own selection points alongside the polygon, so pick the polygon out
   * rather than trusting the first id.
   */
  private readCoordinates(ids: (string | number)[]): void {
    const drawn = ids.map((id) => this.terraDraw.getSnapshotFeature(id)).find((f) => f?.geometry.type === 'Polygon');
    if (drawn) {
      this.zone._coordinates = drawn.geometry.coordinates[0] as Position[];
    }
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
