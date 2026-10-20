import { z } from "zod";

export const playerIdSchema = z.coerce.number().int().positive();

const filterShape = {
  country: z.string().trim().length(3).toUpperCase().optional(),
  sex: z.string().trim().toUpperCase().pipe(z.enum(["M", "F"])).optional(),
};

export const playerFilterQuerySchema = z
  .object(filterShape)
  .transform(({ country, sex }) => ({ countryCode: country, sex }));

export const playerListQuerySchema = z
  .object({
    ...filterShape,
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .transform(({ country, sex, page, limit }) => ({ filter: { countryCode: country, sex }, page, limit }));

export const playerBodySchema = z.object({
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1),
  shortname: z.string().trim().min(1),
  sex: z.enum(["M", "F"]),
  country: z.object({
    picture: z.url(),
    code: z.string().trim().length(3).toUpperCase(),
  }),
  picture: z.url(),
  data: z.object({
    rank: z.number().int().min(1),
    points: z.number().int().min(0),
    weight: z.number().int().positive(),
    height: z.number().int().positive(),
    age: z.number().int().positive(),
    last: z.array(z.union([z.literal(0), z.literal(1)])),
  }),
});
