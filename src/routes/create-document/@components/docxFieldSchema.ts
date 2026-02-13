import z from "zod";

export const docxFieldsSchema = z
	.object({
		fields: z.array(
			z.object({
				identifier: z.string(),
				value: z.string(),
				mappedToColumn: z.string().optional(),
				useAsName: z.boolean(),
			}),
		),
		range: z
			.object({
				from: z.number(),
				to: z.number(),
			})
			.optional(),
		skipHeader: z.boolean(),
	})
	.superRefine((values, ctx) => {
		const { range } = values;
		if (!range) {
			ctx.addIssue({
				code: "custom",
				message: "No hay una columna mapeada",
				path: ["range"],
			});
		} else if (range.from >= range.to) {
			ctx.addIssue({
				code: "custom",
				message: "El rango de columnas no es válido",
				path: ["range"],
			});
		}
	});

export type DocxFieldsSchema = z.infer<typeof docxFieldsSchema>;

export const initialDocxFields: DocxFieldsSchema = {
	fields: [],
	skipHeader: false,
};
