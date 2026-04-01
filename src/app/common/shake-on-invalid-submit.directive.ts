import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appShakeOnInvalidSubmit]'
})
export class ShakeOnInvalidSubmitDirective implements OnChanges {
  @Input('appShakeOnInvalidSubmit') submitAttempt = 0;
  @Input() appShakeInvalid = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submitAttempt'] && !changes['submitAttempt'].firstChange && this.appShakeInvalid) {
      this.triggerShake();
    }
  }

  private triggerShake(): void {
    const host = this.elementRef.nativeElement;
    const dialogContainer = host.closest('.mat-mdc-dialog-container, .mat-dialog-container, .cdk-overlay-pane') as HTMLElement | null;
    const target = dialogContainer || host;

    this.renderer.removeClass(target, 'app-shake-dialog');
    // Force reflow so repeated submits can retrigger the animation.
    void target.offsetWidth;
    this.renderer.addClass(target, 'app-shake-dialog');

    setTimeout(() => {
      this.renderer.removeClass(target, 'app-shake-dialog');
    }, 280);
  }
}
