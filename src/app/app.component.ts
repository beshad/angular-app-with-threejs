import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public title = 'truescape-test-app';
  public isAuth: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.isAuth = this.authService.isAuthenticated();
    // this.authService.isAuth$.subscribe((isAuth) => (this.isAuth = isAuth));
  }
}
