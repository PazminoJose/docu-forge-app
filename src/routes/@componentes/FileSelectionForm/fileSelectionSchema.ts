import { z } from "zod";

export const fileSelectionSchema = z.object({
	documentTemplate: z
		.file()
		.nullable()
		.refine((file) => file !== null, {
			message: "Debe seleccionar una plantilla de documento",
		}),
	dataFile: z
		.file()
		.nullable()
		.refine((file) => file !== null, {
			message: "Debe seleccionar un archivo de datos",
		}),
	outputFolderPath: z.string().refine((value) => value !== "", {
		message: "Debe seleccionar una carpeta de salida",
	}),
});

export type FileSelectionSchema = z.input<typeof fileSelectionSchema>;

export const initialFileSelection: FileSelectionSchema = {
	documentTemplate: null,
	dataFile: null,
	outputFolderPath: "",
};
