import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

import { LoginComponent } from './login.component';

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let componentElement: HTMLElement;

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockAuthService = {
    login() {
      return of(true);
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: FormBuilder },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    componentElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should show error messages when form is empty and submit button is clicked', () => {
    setClickAction(fixture, 'button[data-name="submit-btn"');
    const userNameError = getComponentElementTextContent(
      componentElement,
      'span[data-name="username-required-err"]'
    );
    const passwordError = getComponentElementTextContent(
      componentElement,
      'span[data-name="password-required-err"]'
    );
    expect(userNameError).toEqual('Username is required');
    expect(passwordError).toEqual('Password is required');
  });

  it('should show error message when username contains special characters', () => {
    setInputValue(fixture, 'input[formControlName="username"', 'name??');
    setClickAction(fixture, 'button[data-name="submit-btn"');
    const userPatternError = getComponentElementTextContent(
      componentElement,
      'span[data-name="username-pattern-err"]'
    );

    expect(userPatternError).toEqual(
      'Username should not contain special characters and must be between 5 to 10 characters long'
    );
  });

  it('should show error message when special characters is entered', () => {
    setInputValue(
      fixture,
      'input[formControlName="username"',
      'longLongUserName'
    );
    setClickAction(fixture, 'button[data-name="submit-btn"');
    const userPatternError = getComponentElementTextContent(
      componentElement,
      'span[data-name="username-pattern-err"]'
    );

    expect(userPatternError).toEqual(
      'Username should not contain special characters and must be between 5 to 10 characters long'
    );
  });

  it('should route navigate function is called when form is filled properly and submit button is clicked', () => {
    setInputValue(fixture, 'input[formControlName="username"', 'userName');
    setInputValue(fixture, 'input[formControlName="password"', 'password');
    setClickAction(fixture, 'button[data-name="submit-btn"');
    expect(component['router']['navigate']).toHaveBeenCalled();
  });
});

function setClickAction(
  fixture: ComponentFixture<LoginComponent>,
  selector: string
) {
  const element = fixture.debugElement.nativeElement.querySelector(selector);
  element.click();
  fixture.detectChanges();
}

function setInputValue(
  fixture: ComponentFixture<LoginComponent>,
  selector: string,
  value: string
) {
  const element: HTMLInputElement =
    fixture.nativeElement.querySelector(selector);
  element.value = value;
  element.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function getComponentElementTextContent(
  componentElement: HTMLElement,
  selector: string
): string | undefined {
  return componentElement.querySelector(selector)?.textContent?.trim();
}
