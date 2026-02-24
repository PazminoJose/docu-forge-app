import FileInput from "@components/FileInput";
import FolderInput from "@components/FolderInput";
import { Button, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAppState } from "@stores/app.store";
import { IconArrowBigRightFilled, IconFileFilled } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useShallow } from "zustand/react/shallow";
import { type FileSelectionSchema, fileSelectionSchema } from "./fileSelectionSchema";

export default function FileSelectionForm() {
	const setDataFilePath = useAppState((state) => state.setDataFilePath);
	const setTemplateFilePath = useAppState((state) => state.setTemplateFilePath);
	const setOutputFolderPath = useAppState((state) => state.setOutputFolderPath);
	const router = useRouter();

	const appState = useAppState(
		useShallow((state) => ({
			dataFilePath: state.dataFilePath,
			templateFilePath: state.templateFilePath,
			outputFolderPath: state.outputFolderPath,
		})),
	);

	const form = useForm({
		initialValues: appState,
		validate: zod4Resolver(fileSelectionSchema),
	});

	const handleContinue = async (values: FileSelectionSchema) => {
		setDataFilePath(values.dataFilePath);
		setTemplateFilePath(values.templateFilePath);
		setOutputFolderPath(values.outputFolderPath);
		router.navigate({
			to: "/create-document",
		});
	};

	return (
		<form
			className="flex h-full flex-col items-center justify-center gap-4"
			onSubmit={form.onSubmit(handleContinue)}
		>
			<div className="flex flex-col">
				<IconFileFilled size={64} className="mx-auto text-primary-500" />
				<Text className="text-center font-semibold text-2xl">Generador de documentos</Text>
				<Text className="text-center text-base text-gray-600">
					Genera documentos en masa a partir de archivos de datos y plantillas.
				</Text>
			</div>
			<FileInput {...form.getInputProps("dataFilePath")} extensions={["xlsx"]}>
				Seleccione el archivo de datos (Excel)
			</FileInput>
			<FileInput {...form.getInputProps("templateFilePath")} extensions={["pdf", "docx"]}>
				Seleccione la plantilla de documento (DOCX)
			</FileInput>
			<FolderInput {...form.getInputProps("outputFolderPath")}>
				Seleccione en donde guardar los documentos generados
			</FolderInput>
			<div className="mx-auto">
				<Button type="submit" className="bg-primary-500" rightSection={<IconArrowBigRightFilled />}>
					Continuar
				</Button>
			</div>
		</form>
	);
}
