import { Injectable, Inject } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { map } from './rxjs.util';

import { AuthService } from './auth.service';
import { AUTH_SERVICE, PROTECTED_FALLBACK_PAGE_URI } from './tokens';

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 *
 * usage: { path: 'test', component: TestComponent, canActivate: [ PublicGuard ] }
 *
 * @export
 */
@Injectable()
export class PublicGuard implements CanActivate, CanActivateChild {

  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    @Inject(PROTECTED_FALLBACK_PAGE_URI) private protectedFallbackPageUri: string,
    private router: Router
  ) {}

  /**
   * CanActivate handler
   */
  public canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return map(
      this.authService.isAuthorized(),
      (isAuthorized: boolean) => {

        if (isAuthorized && !this.isProtectedPage(state)) {
          this.navigate(this.protectedFallbackPageUri);

          return false;
        }

        return true;
      }
    );
  }

  /**
   * CanActivateChild handler
   */
  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(route, state);
  }

  /**
   * Check, if current page is protected fallback page
   */
  private isProtectedPage(state: RouterStateSnapshot): boolean {
    return state.url === this.protectedFallbackPageUri;
  }

  /**
   * Navigate away from the app / path
   */
  private navigate(url: string): void {
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      this.router.navigateByUrl(url);
    }
  }

}
