import z from "zod";

export const docxFieldsSchema = z
	.object({
		fields: z.array(
			z.object({
				identifier: z.string(),
				value: z.string(),
				mappedToColumn: z
					.string()
					.optional()
					.refine((val) => val !== "", {
						message: "El campo mappedToColumn no puede ser una cadena vacía",
					}),
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
		const { range, fields } = values;
		if (!range) {
			ctx.addIssue({
				code: "custom",
				message: "No hay un rango de columnas definido",
				path: ["range"],
			});
		} else if (range.from >= range.to) {
			ctx.addIssue({
				code: "custom",
				message: "El rango de columnas no es válido",
				path: ["range"],
			});
		}
		fields.forEach((field, index) => {
			if (!field.mappedToColumn) {
				ctx.addIssue({
					code: "custom",
					message: "Ninguna columna seleccionada para este campo",
					path: ["fields", index, "mappedToColumn"],
				});
			}
		});
	});

export type DocxFieldsSchema = z.infer<typeof docxFieldsSchema>;

export const initialDocxFields: DocxFieldsSchema = {
	fields: [],
	skipHeader: false,
};
