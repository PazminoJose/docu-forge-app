import { z } from "zod";

export const fileSelectionSchema = z.object({
	dataFilePath: z.string().refine((value) => value !== "", {
		message: "Debe seleccionar un archivo de datos",
	}),
	templateFilePath: z.string().refine((value) => value !== "", {
		message: "Debe seleccionar una plantilla de documento",
	}),
	outputFolderPath: z.string().refine((value) => value !== "", {
		message: "Debe seleccionar una carpeta de salida",
	}),
});

export type FileSelectionSchema = z.infer<typeof fileSelectionSchema>;

export const initialFileSelection: FileSelectionSchema = {
	templateFilePath: "",
	dataFilePath: "",
	outputFolderPath: "",
};
