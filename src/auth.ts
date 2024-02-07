import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { stringAsNumber } from './schema/utils';
import { prisma } from './index';

export const Role = {
  ADMIN: 0,
  USER: 1,
  DRIVER: 2
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export interface AuthUser {
  id: number;
  role: RoleType;
}

declare module 'hono' {
  interface ContextVariableMap {
    user?: AuthUser;
  }
}

export const auth = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const credentials =
      ctx.req.raw.headers.get('Authorization') ||
      ctx.req.raw.headers.get('X-Authorization');
    let token;

    if (credentials) {
      const parts = credentials.split(/\s+/);
      if (parts.length !== 2) {
        await next();
        return;
      } else {
        token = parts[1];
      }
    } else {
      token = getCookie(ctx, 'auth');
    }

    if (!token) {
      await next();
      return;
    }

    const idResult = stringAsNumber.safeParse(token);

    if (!idResult.success) {
      return ctx.json(
        {
          message: 'Bad request, bad auth type (number required)',
          ok: false,
          status: 400
        },
        400,
        {
          'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="bad authorization included in request"`
        }
      );
    }

    const id = idResult.data;

    // this is not secure:
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!user) {
      return ctx.json(
        {
          message: 'Unauthorized, unknown user',
          ok: false,
          status: 401
        },
        401,
        {
          'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="unknown user"`
        }
      );
    }

    ctx.set('user', user);

    await next();
  };
};

export const requireAuth = (): MiddlewareHandler => {
  return async (ctx, next) => {
    if (!ctx.get('user')) {
      return ctx.json({ message: 'Unauthorized', ok: false }, 401, {
        'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="no authorization included in request"`
      });
    }
    await next();
  };
};
