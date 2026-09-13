const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  dateTime: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), 'dateTime must be a valid date')
    .refine((val) => new Date(val).getTime() > Date.now(), 'dateTime must be in the future'),
  location: z.string().trim().min(1).max(300),
  capacity: z.number().int().positive(),
});

const updateEventSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    dateTime: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), 'dateTime must be a valid date')
      .refine((val) => new Date(val).getTime() > Date.now(), 'dateTime must be in the future')
      .optional(),
    location: z.string().trim().min(1).max(300).optional(),
    capacity: z.number().int().positive().optional(),
  })
  .strict();

module.exports = { createEventSchema, updateEventSchema };
