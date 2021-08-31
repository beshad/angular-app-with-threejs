import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  public isAuthenticated(): boolean {
    const userName = localStorage.getItem('currentUserName');
    return !!userName;
  }

  public login(username: string, password: string): Observable<boolean> {
    const authericationResult$ = this.authenticateUser(username, password);
    return authericationResult$.pipe(
      startWith(true),
      map((result) => {
        if (result) {
          localStorage.setItem('currentUserName', username);
        }
        return result;
      })
    );
  }

  private authenticateUser(
    username: string,
    password: string
  ): Observable<boolean> {
    const url = 'user/authenticate';
    const body = { username, password };
    return this.http.post<boolean>(url, body);
  }
}
