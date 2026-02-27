import { generateDocumentSchema } from "src/routes/generate-docx/@schemas/generateDocumentSchema";
import z from "zod";

export const generateMultipleDocxSchema = z.object({
	...generateDocumentSchema.shape,
	fields: z.array(
		z.object({
			identifier: z.string(),
			value: z.string(),
			mappedToColumn: z.string().nullable(),
			mappedToSheet: z.string().nullable(),
			useAsName: z.boolean(),
			filterValues: z
				.array(
					z.object({
						columns: z.array(z.string()),
						value: z.string(),
					}),
				)
				.nullable(),
		}),
	),
	filters: z.array(
		z.object({
			column: z.string(),
			label: z.string(),
			index: z.number(),
			useAsFolderName: z.boolean().optional(),
		}),
	),
	templateMapping: z.array(
		z.object({
			combination: z.array(
				z.object({
					column: z.string(),
					value: z.string(),
				}),
			),
			templatePath: z.string(),
		}),
	),
});

export type GenerateMultipleDocxSchema = z.infer<
	typeof generateMultipleDocxSchema
>;

export const initialGenerateMultipleDocx: GenerateMultipleDocxSchema = {
	fields: [],
	skipHeader: false,
	filters: [],
	templateMapping: [],
	applyToAllSheets: false,
	mergeGeneratedFiles: false,
	range: {
		from: 0,
		to: 0,
	},
};
