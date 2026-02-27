import { z } from "zod";

export const fileSelectionSchema = z
	.object({
		dataFilePath: z.string().refine((value) => value !== "", {
			message: "Debe seleccionar un archivo de datos",
		}),
		templateFilePath: z.string(),
		outputFolderPath: z.string().refine((value) => value !== "", {
			message: "Debe seleccionar una carpeta de salida",
		}),
		multipleTemplatesMode: z.boolean(),
	})
	.superRefine((values, ctx) => {
		if (!values.multipleTemplatesMode && values.templateFilePath === "") {
			ctx.addIssue({
				code: "custom",
				message: "Debe seleccionar una plantilla de documento o activar el modo de múltiples plantillas",
			});
		}
	});

export type FileSelectionSchema = z.infer<typeof fileSelectionSchema>;

export const initialFileSelection: FileSelectionSchema = {
	templateFilePath: "",
	dataFilePath: "",
	outputFolderPath: "",
	multipleTemplatesMode: false,
};
