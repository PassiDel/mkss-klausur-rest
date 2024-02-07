import { z } from '@hono/zod-openapi';

export const stringAsNumber = z
  .string()
  .trim()
  .refine((s) => z.number().int().min(1).safeParse(Number(s)).success)
  .transform(Number);

export const idParam = z.object({
  id: stringAsNumber.openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 123
  })
});
