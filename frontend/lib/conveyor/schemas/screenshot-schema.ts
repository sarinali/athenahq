import { z } from 'zod'

const ScreenshotResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.number(),
  status: z.string().optional(),
  nudge: z.string().nullable().optional(),
  showOverlay: z.boolean().optional(),
})

export const screenshotIpcSchema = {
  'screenshot-start-polling': {
    args: z.union([z.tuple([z.string()]), z.tuple([z.string(), z.number()])]), // [apiEndpoint] or [apiEndpoint, pollInterval]
    return: z.boolean(),
  },
  'screenshot-stop-polling': {
    args: z.tuple([]),
    return: z.boolean(),
  },
  'screenshot-is-polling': {
    args: z.tuple([]),
    return: z.boolean(),
  },
  'screenshot-capture-manual': {
    args: z.tuple([]),
    return: ScreenshotResultSchema,
  },
  'screenshot-capture-with-intent': {
    args: z.tuple([z.string()]),
    return: ScreenshotResultSchema,
  },
  'screenshot-set-endpoint': {
    args: z.tuple([z.string()]),
    return: z.boolean(),
  },
  'screenshot-set-interval': {
    args: z.tuple([z.number()]),
    return: z.boolean(),
  },
  'screenshot-send-string': {
    args: z.tuple([z.string()]),
    return: ScreenshotResultSchema,
  },
} as const
