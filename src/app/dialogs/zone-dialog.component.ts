import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Zone } from '../classes/Zone';
import { GC } from '../common/GC';
import { LngLatBoundsLike, Map } from 'mapbox-gl';
import { initMap } from '../UTIL';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import { bbox, Feature, MultiPolygon, polygon, Polygon, union } from '@turf/turf';

@Component({
  selector: 'app-zone-dialog',
  template: `
    <div style="width: 75vw">
      <h1 mat-dialog-title>zone speichern</h1>
      <div class="flex flex-row justify-content-between align-items-baseline p-4">
        <div class="flex flex-row align-items-center">
          <mat-form-field>
            <mat-label>name</mat-label>
            <input [(ngModel)]="zone.name" matInput type="text" />
          </mat-form-field>
          <app-price-input class="ml-3" [(price)]="zone.price" [label]="'preis pro stop'" [width]="80" [type]="0"></app-price-input>
          <mat-checkbox class="ml-3" disabled [checked]="zone.isSubstractive">substraktive zone</mat-checkbox>
        </div>

        <div>{{ zone.nrOfPoints }} punkte, {{ zone.area }}km²</div>
      </div>

      <div id="mapcontainer">
        <div #map id="map"></div>
      </div>

      <div class="flex flex-column">
        <!-- <searchinput
          #zoneSearchbar
          [width]="'250px'"
          [label]="'zone hinzufügen'"
          [searchZones]="true"
          [searchPostCodeZones]="true"
          (zoneSelected)="addToMap($event.polygon)">
        </searchinput> -->

        <button #yes mat-raised-button class="ml-3 my-4 fex-button" (click)="saveZone()" matDialogClose>speichern</button>
      </div>
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

  @ViewChild('map') mapContainer: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      zone: Zone;
    }
  ) {
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

  saveZone(): void {
    if (this.zone.id) {
      GC.http.updateZone(this.zone).subscribe(() => {
        GC.openSnackBarLong('zone gespeichert');
        this.confirm.emit(this.zone);
      });
    } else {
      GC.http.createZone(this.zone).subscribe(() => {
        GC.openSnackBarLong('zone gespeichert');
        this.confirm.emit(this.zone);
      });
    }
  }
}
