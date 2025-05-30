import { IPoint, LocType, PassType, Section } from '../common/interfaces';
import { Station } from './Geolocation';
import { Price } from './Price';
import { FexRules, PriceStrategy } from './PriceStrategies';
import { GC } from '../common/GC';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { Job } from './Job';
import { Routing } from '../common/Routing';
import { Zone } from './Zone';

export class Branch {
  get routeWithBridges(): IPoint[] {
    if (!this._routeWithBridges) {
      this._routeWithBridges = Routing.findRoute(this.route.filter((station) => station.passType !== PassType.nearby).concat(this.center));
    }
    return this._routeWithBridges;
  }

  get routeWithoutBridges(): IPoint[] {
    if (!this._routeWithoutBridges) {
      this._routeWithoutBridges = this.route.filter((station) => station.passType !== PassType.nearby).concat(this.center);
    }
    return this._routeWithoutBridges;
  }

  private _routeWithBridges: IPoint[];
  private _routeWithoutBridges: IPoint[];
  sections: Section[];
  closed = false;
  center: Station;
  private _distance: number; // length
  isConnection: boolean;
  _price = new Price();
  priceStrategy: PriceStrategy = new FexRules();
  finished = false;

  /**
   * @return the source station of this branch
   */
  get source(): Station {
    return this.route[0];
  }

  /**
   * returns all the zones, a branch has stations in.
   * if a station doesn't use the zone discount, because it's a stop
   * the zone won't be returned
   * @return a set of all the zones (no doublets)
   */
  get zones(): Zone[] {
    return [...this.route.map((s) => s.zone).filter((z) => !!z)];
  }

  set distance(d: number) {
    this._distance = d;
    this.price;
  }

  /**
   * returns or calculates the priceable distance of this branch
   * @return distance in km
   */
  get distance(): number {
    if (!this._distance) {
      this._distance = Routing.arrayDist(this.routeWithBridges);
    }
    return this._distance;
  }

  constructor(
    public job: Job,
    public route: Station[],
    center: Station,
    public type: LocType
  ) {
    this.center = new Station(center);
  }

  /**
   * calculates the branch in the way it will be displayed on the map
   * also activates zones for the stations
   * @return the branch itself for chaining
   */
  finish(): Branch {
    this.finished = true;
    this.findZones();
    return this;
  }

  /**
   * returns or calculates the price for the branch
   * @return the calling branch for chaining
   */
  get price(): Price {
    if (!this.sections) {
      this.findSections();
      this.calcPrice();
    }
    return this._price;
  }

  private calcPrice(): Price {
    this._price = this.priceStrategy.calcBranchPrice(this);
    return this._price;
  }

  /**
   * divides a route recursively into its priceable sections.
   * a section includes all points of a route that are between two stations
   * that are either of passtype source (0), route (3) or center (4),
   * including also those two limiting stations.
   * findSections(0, 2, 3, 4) will return [[0, 2, 3], [3, 4]]
   * @return all section of my route. a route with only the center-station
   * will output an empty array.
   */
  findSections(): Branch {
    const recursive = (route: IPoint[], counter: number): Section[] => {
      // if route is empty return an empty array
      if (route[0].passType === PassType.center) {
        return [];
      }
      const res: Section[] = [];
      // find first occasion of a station of type ROUTE or CENTER which will be the end of the actual section
      const index = route.indexOf(route.slice(1).find((p) => p.passType >= 3));
      if (route[index] === undefined) {
        return [];
      }
      // first element in route will be either SOURCE or ROUTE
      // because it is sliced recursively
      route[0].routePointNr = counter;
      // canceling recursion if the found element is the last one in the route
      if (index === route.length - 1) {
        const length = Routing.arrayDist(route);
        res.push({
          points: route,
          traveldist: length,
          price: Routing.distPrice(length)
        });
        return res;
      } else {
        const length = Routing.arrayDist(route.slice(0, index + 1));
        res.push({
          points: route.slice(0, index + 1),
          traveldist: length,
          price: Routing.distPrice(length)
        });
        return res.concat(recursive(route.slice(index, route.length), counter + 1));
      }
    };

    if (!this._routeWithBridges) {
      this._routeWithBridges = GC.streetRouting
        ? this.route.filter((station) => station.passType !== PassType.nearby).concat(this.center)
        : Routing.findRoute(this.route.filter((station) => station.passType !== PassType.nearby).concat(this.center));
    }
    this.sections = recursive(this._routeWithBridges, 0);
    return this;
  }

  /**
   * looks for the smallest and cheapest zone applying for a station
   * @param station the station to search for
   * @param inclusive wether station should be checked for inclusive, exclusive zones or both
   * @param startIndex put a value > 0 to exclude certain zones on the search
   * @return the cheapest zone, a station is located in
   */
  private static findZone(station: Station, inclusive: 'IN' | 'OUT' | 'BOTH', startIndex?: number): Zone {
    let res: Zone;
    let zones: Zone[];
    switch (inclusive) {
      case 'IN':
        zones = GC.inclusiveZones;
        break;
      case 'OUT':
        zones = GC.exclusiveZones;
        break;
      case 'BOTH':
        zones = GC.zones;
        break;
    }
    for (let i = startIndex || 0; i < zones.length; i++) {
      let zone = zones[i];
      switch (inclusive) {
        case 'IN':
          if (booleanPointInPolygon([station.longitude, station.latitude], zone.polygon)) {
            return zone;
          }
          break;
        case 'OUT':
          if (!booleanPointInPolygon([station.longitude, station.latitude], zone.polygon)) {
            return zone;
          }
          break;
        case 'BOTH':
          if (zone.isSubstractive !== booleanPointInPolygon([station.longitude, station.latitude], zone.polygon)) {
            return zone;
          }
          break;
      }
    }
    return null;
  }

  /**
   * looks for applying zones for all stations on the route
   * leaves untouched all stops with passtype STOP or NEARBY
   * if no zone is found for a station, search will be interrupted
   * (branch left the zone and cannot enter again, supposing the route is only going further out)
   * @return the calling branch for chain of responsability
   */
  findZones(): Branch {
    this.job.center.zone = Branch.findZone(this.center, 'IN');
    this.route.last().zone = Branch.findZone(this.route.last(), 'OUT');
    if (!this.job.center.zone || this.route.last().zone) {
      // if center is in no inclusive zone
      // or the furthest station is in an exclusive zone
      // there is no point of looking further
      // just check if center might be in an outside zone
      this.job.center.zone = Branch.findZone(this.center, 'OUT');
      return this;
    }
    for (let i = this.route.length - 1; i >= 0; i--) {
      if (this.route[i].passType === PassType.stop || this.route[i].passType === PassType.nearby) {
        continue;
      }
      let zone = Branch.findZone(this.route[i], 'IN', this.center.zone?.index);
      this.route[i].zone = zone;
      if (!zone) {
        break;
      }
    }
    return this;
  }

  nextDistPoint(s: Station): Station {
    const list = this.route.filter((st) => st.passType === PassType.route);
    return list[list.indexOf(s) + 1] || this.center;
  }
}
