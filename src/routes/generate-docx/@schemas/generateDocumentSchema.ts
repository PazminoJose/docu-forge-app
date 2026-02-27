import z from "zod";

export const generateDocumentSchema = z
	.object({
		fields: z.array(
			z.object({
				identifier: z.string(),
				value: z.string(),
				mappedToColumn: z.string().nullable(),
				mappedToSheet: z.string().nullable(),
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
		applyToAllSheets: z.boolean(),
		mergeGeneratedFiles: z.boolean(),
	})
	.superRefine((values, ctx) => {
		const { range } = values;
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
	});
