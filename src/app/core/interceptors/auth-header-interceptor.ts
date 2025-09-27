import { HttpInterceptorFn } from '@angular/common/http';

export const authHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
