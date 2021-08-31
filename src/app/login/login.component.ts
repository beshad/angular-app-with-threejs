import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.loginForm = this.getLoginForm();
  }

  ngOnInit(): void {}

  public onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.authService
      .login(this.userFormControl.value, this.passwordFormControl.value)
      .pipe(take(1))
      .subscribe((result) => this.handleAuthenticationResult(result));
  }

  public get userFormControl(): AbstractControl {
    return this.loginForm.controls.username;
  }

  public get passwordFormControl(): AbstractControl {
    return this.loginForm.controls.password;
  }

  private getLoginForm() {
    return this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(new RegExp('^[a-zA-Z0-9]{5,10}$')),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  private handleAuthenticationResult(isAuthenticated: boolean) {
    if (isAuthenticated) {
      this.router.navigate(['/']);
    }
  }
}
