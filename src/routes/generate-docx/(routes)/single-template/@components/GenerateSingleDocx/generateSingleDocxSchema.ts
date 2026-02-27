import { generateDocumentSchema } from "src/routes/generate-docx/@schemas/generateDocumentSchema";
import z from "zod";

export const generateSingleDocxSchema = z.object({
	...generateDocumentSchema.shape,
});

export type GenerateSingleDocxSchema = z.infer<typeof generateSingleDocxSchema>;

export const initialGenerateSingleDocx: GenerateSingleDocxSchema = {
	fields: [],
	skipHeader: false,
	applyToAllSheets: false,
	range: {
		from: 0,
		to: 0,
	},
	mergeGeneratedFiles: false,
};
