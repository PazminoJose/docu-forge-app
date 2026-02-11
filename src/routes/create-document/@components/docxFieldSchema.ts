import z from "zod";

export const docxFieldsSchema = z.object({
	fields: z.array(
		z.object({
			identifier: z.string(),
			value: z.string(),
			mappedToColumn: z.string().optional(),
			range: z
				.object({
					from: z.number().optional(),
					to: z.number().optional(),
				})
				.optional(),
		}),
	),
});

export type DocxFieldsSchema = z.infer<typeof docxFieldsSchema>;

export const initialDocxFields: DocxFieldsSchema = {
	fields: [],
};
