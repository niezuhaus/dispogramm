import { Price } from './Price';
import { Job, RegularJob } from './Job';
import { Note } from './Note';
import { MorningTour } from '../common/interfaces';
import { Messenger } from './Messenger';
import { GC } from '../common/GC';
import { MorningTourDialogComponent } from '../dialogs/morning-tour-dialog.component';
import { zip } from 'rxjs';

export class TourplanItem {
  private date: Date;
  private price: Price;
  private name: string;
  job: Job;
  regularJob: RegularJob;
  note: Note;
  index: number;
  morningTour: MorningTour = NaN;
  regularJobs: RegularJob[] = [];
  convertedJobs: Job[] = [];
  edit: boolean;

  get _date(): Date {
    return this.date || this.job?.date || this.regularJob?.date || this.note?.date;
  }

  set _date(date: Date) {
    this.date = date;
    if (this.job) {
      this.job.date = date;
    }
    if (this.note) {
      this.note.date = date;
    }
    if (this.regularJob) {
      this.regularJob.date = date;
    }
  }

  get _price(): Price {
    return this.price || this.job?.price || this.regularJob?.price || undefined;
  }

  set _price(price: Price) {
    this.price = price;
  }

  get _name(): string {
    return this.name || this._job?.name || this._job?.center?.name || this._job?.center?.address || this.note?.text;
  }

  get print(): string {
    return this._job?.toString();
  }

  set _name(name: string) {
    this.name = name;
  }

  set _colour(colour: string) {
    if (this.isMorningTour) {
      if (this.regularJobs.length) {
        zip(this.regularJobs.map((rj) => rj.convert(this.date))).subscribe((list) => {
          this.convertedJobs.pushArray(list);
          this.convertedJobs.forEach((j) => (j._colour = colour));
        });
      } else {
        this.convertedJobs.forEach((j) => (j._colour = colour));
      }
    } else {
      this.job._colour = colour;
    }
  }

  get _colour() {
    return this.isMorningTour ? this.convertedJobs[0]?.colour || '0000' : this._job?.colour || '0000';
  }

  get _description(): string {
    return this._job?.description || this.note?.text;
  }

  set _description(value: string) {
    this._job ? (this._job.description = value) : (this.note.text = value);
  }

  get _job(): Job {
    return this.job || this.regularJob || null;
  }

  get _note(): Note {
    return this.note;
  }

  get _messenger(): Messenger {
    return this.job?.messenger || this.convertedJobs.map((j) => j.messenger)[0];
  }

  get _creator(): Messenger {
    return this.job?.creator || this.note?.creator || null;
  }

  get _billingTour(): boolean {
    return this._job?.billingTour || this.isRegularJob || this.morningTour > 0;
  }

  get isJob(): boolean {
    return !!this.job;
  }

  get isPrePlanned(): boolean {
    return !this.isRegularJob && this._job?.date.getTime() > this._job?.creationDate.getTime();
  }

  get isAbstractJob(): boolean {
    return !!this._job;
  }

  /**
   * returns true, if the tpi contains a regular job object
   * OR a converted regular job object
   */
  get isRegularJob(): boolean {
    return !!(this.regularJob || this.job?.regularJobId);
  }

  get isTemplate(): boolean {
    return !!this.regularJob;
  }

  get isConverted(): boolean {
    return !!this.job?.regularJobId;
  }

  get isNote(): boolean {
    return !!this.note;
  }

  get isMorningTour(): boolean {
    return !isNaN(this.morningTour);
  }

  get morningJobs(): number {
    return this.convertedJobs?.length || this.regularJobs.length;
  }

  constructor(data: Partial<TourplanItem>) {
    if (data) {
      Object.assign(this, data);
    }

    if (this.isTemplate) {
      this.price = this.regularJob.monthlyPrice.regularJobPrice;
    }
  }

  openMorningTour(): void {
    GC.dialog.open(MorningTourDialogComponent, {
      data: {
        name: GC.posttours[this.morningTour],
        items: this.convertedJobs.map((j) => new TourplanItem({ job: j })).concat(this.regularJobs.map((rj) => new TourplanItem({ regularJob: rj })))
      }
    });
  }

  /**
   * returns true, if a tourplan item:
   * - has no assigned messenger
   * - && (
   * @param job the tourplan item to calculate the alarm state for
   */
  get isAlarm(): boolean {
    return (
      !this._messenger &&
      // tour is planned and
      ((this._job?.isPlanned &&
        this.timeUntil.isBetween(
          GC.config.tourplan.ALARM_STOP * -3600000, // ms of an hour
          GC.config.tourplan.PRE_ORDER_ALARM * 60000
        )) || // ms of a minute
        this.timeUntil.isBetween(GC.config.tourplan.ALARM_STOP * -3600000, GC.config.tourplan.NORMAL_ALARM * -60000))
    );
  }

  /**
   * @return the amount of time, the date of this job is in the future.
   *  returns a negative value, if the date is in the past
   */
  get timeUntil(): number {
    return this._date.getTime() - new Date().getTime();
  }

  save(): void {
    if (this.isNote) {
      GC.http.saveNote(this.note).subscribe(() => {
        GC.openSnackBarLong('notiz wurde gespeichert');
      });
    } else {
      this._job.save('änderungen wurden gespeichert').subscribe(() => {
        this.edit = false;
      });
    }
  }
  // should send a mail to info@sprint-logistik.com with a resume of the job
  sendMail(): void {
    const to = 'info@sprint-logistik.com';

    const dateStr = this._date ? this._date.toLocaleDateString('de-DE') : '';
    const timeStr = this._date ? this._date.toLocaleTimeString('de-DE') : '';

    const lines: string[] = [];
    lines.push('moin sprint,');
    lines.push('könnt ihr die folgende tour übernehmen?,');
    lines.push('');
    lines.push(`Datum / Zeit: ${dateStr}${dateStr && timeStr ? ', ' + timeStr : ''}`);
    lines.push('');

    // Customer / center info
    const center = this._job?.center || this.regularJob?.center || (this.note ? null : null);
    lines.push('Kund:in:');
    if (center?.name) lines.push(center.name);
    if (center?.address) lines.push(center.address);
    if (!center?.name && !center?.address) lines.push('');

    // Helpers
    const formatStop = (s: any) => {
      const title = s?.name || s?.title || s?.contact || s?.person || s?.type || '';
      const addr = s?.address || s?.location || s?.street || s?.addr || '';
      if (title && addr) return `${title} — ${addr}`;
      if (addr) return addr;
      if (title) return title;
      try {
        return JSON.stringify(s);
      } catch {
        return String(s);
      }
    };

    // Collect jobs/regularJobs/convertedJobs to include their pickups/deliveries
    const jobsToInspect: any[] = [];
    if (this._job) jobsToInspect.push(this._job);
    if (this.convertedJobs?.length) jobsToInspect.push(...this.convertedJobs);
    if (this.regularJobs?.length) jobsToInspect.push(...this.regularJobs);

    // classify stops
    const deliveriesProps = ['deliveries', 'delivery', 'stops', 'addresses'];
    const pickupsProps = ['pickups', 'pickup'];

    const deliveries: any[] = [];
    const pickups: any[] = [];

    jobsToInspect.forEach((job) => {
      deliveriesProps.forEach((prop) => {
        const list = job[prop];
        if (Array.isArray(list) && list.length) {
          list.forEach((s: any) => deliveries.push({ stop: s, job }));
        }
      });
      pickupsProps.forEach((prop) => {
        const list = job[prop];
        if (Array.isArray(list) && list.length) {
          list.forEach((s: any) => pickups.push({ stop: s, job }));
        }
      });
    });

    // Abgaben (deliveries)
    lines.push('');
    lines.push('Abgaben:');
    if (deliveries.length) {
      deliveries.forEach((d, i) => {
        lines.push(`  ${i + 1}. ${formatStop(d.stop)}`);
      });
    } else {
      lines.push('  Keine Abgaben.');
    }

    // Abholungen (pickups)
    lines.push('');
    lines.push('Abholungen:');
    if (pickups.length) {
      pickups.forEach((p, i) => {
        lines.push(`  ${i + 1}. ${formatStop(p.stop)}`);
      });
    } else {
      lines.push('  Keine Abholungen.');
    }

    // Kurzzusammenfassung
    lines.push('');
    lines.push('Kurzzusammenfassung:');
    const summary: string[] = [];
    let counter = 1;
    // deliveries first with arrow →
    deliveries.forEach((d) => {
      const subject = (d.job?.center?.name || this._name || 'Auftrag') as string;
      const short = d.stop?.name || d.stop?.title || d.stop?.address || formatStop(d.stop);
      summary.push(`${counter}. ${subject} → ${short}`);
      counter++;
    });
    // pickups with arrow ←
    pickups.forEach((p) => {
      const subject = (p.job?.center?.name || this._name || 'Auftrag') as string;
      const short = p.stop?.name || p.stop?.title || p.stop?.address || formatStop(p.stop);
      summary.push(`${counter}. ${subject} ← ${short}`);
      counter++;
    });
    if (summary.length) {
      summary.forEach((s) => lines.push(s));
    } else {
      lines.push('Keine Kurz­zusammenfassung verfügbar.');
    }

    // Price
    const priceVal = this._price?.toString?.() ?? (this._price !== undefined ? String(this._price) : (this._job?.price?.toString?.() ?? ''));
    if (priceVal) {
      lines.push('');
      lines.push(`Preis: ${priceVal}`);
    }

    // Note / morning tour info
    if (this.note) {
      lines.push('');
      lines.push(`Notiz: ${this.note.text}`);
    }
    if (this.isMorningTour) {
      lines.push('');
      lines.push(`Morgentour: ${GC.posttours[this.morningTour] ?? this.morningTour}`);
      lines.push(`Anzahl Morgentour Jobs: ${this.morningJobs}`);
    }

    lines.push('');
    lines.push('vielen dank und gute fahrt,');
    lines.push('fex');

    const body = lines.join('\n');

    try {
      const subjectParts: string[] = [];
      if (this._date) subjectParts.push(this._date.toLocaleDateString('de-DE'));
      if (this._name) subjectParts.push(this._name);
      const subject = subjectParts.length ? `Tourplan Item - ${subjectParts.join(' - ')}` : 'Tourplan Item';
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // open default mail client
      window.open(mailto);
      GC.openSnackBarLong('E-Mail-Client geöffnet, um die Zusammenfassung zu versenden.');
    } catch (e) {
      GC.openSnackBarLong('Fehler beim Öffnen des E-Mail-Clients.');
      console.error('sendMail error', e);
    }
  }
}
