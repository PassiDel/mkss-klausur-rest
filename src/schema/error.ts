import { z } from '@hono/zod-openapi';

export const errorSchema = z
  .object({
    success: z.boolean().openapi({
      example: false
    }),
    error: z
      .object({
        issues: z.array(
          z.object({
            message: z
              .string()
              .openapi({ example: 'Expected string, received number' }),
            code: z.string().openapi({ example: 'invalid_type' })
          })
        ),
        name: z.string().openapi({ example: 'ZodError' })
      })
      .optional()
      .openapi({
        example: {
          issues: [
            {
              code: 'invalid_type',
              message: 'Expected string, received number'
            }
          ],
          name: 'ZodError'
        }
      })
  })
  .openapi('Error');

export function errorFactory(status: number, description: string) {
  return {
    content: {
      'application/json': {
        schema: errorSchema,
        example: {
          success: false,
          error: {
            name: description,
            issues: []
          }
        }
      }
    },
    description
  };
}
