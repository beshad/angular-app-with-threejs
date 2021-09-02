import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public isAuth: boolean = false;

  private ngUnSubscribe$ = new Subject();

  ngOnDestroy() {
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    this.checkAuthValue();
  }

  private checkAuthValue() {
    this.authService.currentUserName$
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe((userName) => (this.isAuth = !!userName));
  }
}
