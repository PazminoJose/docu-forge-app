import { DropZoneInput } from "@components/DropZoneInput";
import FolderInput from "@components/FolderInput";
import { Button, Text } from "@mantine/core";
import { MS_EXCEL_MIME_TYPE, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useAppState } from "@stores/app.store";
import { IconArrowBigRightFilled, IconFileFilled, IconFileSpreadsheet } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useShallow } from "zustand/react/shallow";
import { type FileSelectionSchema, fileSelectionSchema } from "./fileSelectionSchema";

export default function FileSelectionForm() {
	const setDataFile = useAppState((state) => state.setDataFile);
	const setDocumentTemplate = useAppState((state) => state.setDocumentTemplate);
	const setOutputFolderPath = useAppState((state) => state.setOutputFolderPath);

	const appState = useAppState(
		useShallow((state) => ({
			dataFile: state.dataFile,
			documentTemplate: state.documentTemplate,
			outputFolderPath: state.outputFolderPath,
		})),
	);

	const router = useRouter();

	const form = useForm({
		mode: "uncontrolled",
		initialValues: appState as FileSelectionSchema,
		validate: zod4Resolver(fileSelectionSchema),
		onValuesChange: (values) => {
			setDataFile(values.dataFile);
			setDocumentTemplate(values.documentTemplate);
			setOutputFolderPath(values.outputFolderPath);
		},
	});

	const handleContinue = async () => {
		const template = await appState.documentTemplate?.arrayBuffer();
		const templateExtension = appState.documentTemplate?.name.split(".").pop() || "";
		const dataFile = await appState.dataFile?.arrayBuffer();
		const res = await invoke<string[]>("save_doc", {
			template,
			templateExtension,
			dataFile,
		});
		router.navigate({
			to: "/create-document",
		});
	};

	return (
		<form className="flex h-full flex-col gap-4 py-4" onSubmit={form.onSubmit(handleContinue)}>
			<div className="flex flex-col">
				<IconFileFilled size={64} className="mx-auto text-primary-500" />
				<Text className="text-center font-semibold text-2xl">Generador de documentos</Text>
				<Text className="text-center text-base text-gray-600">
					Genera documentos en masa a partir de archivos de datos y plantillas.
				</Text>
			</div>
			<DropZoneInput
				form={form}
				name="dataFile"
				idleIcon={<IconFileSpreadsheet size={52} stroke={1.5} color="var(--mantine-color-dimmed)" />}
				label="Seleccione o arrastre un archivo EXCEL aquí"
				description="Solo se permite un archivo"
				accept={MS_EXCEL_MIME_TYPE}
			/>
			<DropZoneInput
				form={form}
				name="documentTemplate"
				label="Seleccione o arrastre una plantilla PDF o WORD aquí"
				description="Solo se permite un archivo"
				accept={[...MS_WORD_MIME_TYPE, ...PDF_MIME_TYPE]}
			/>
			<FolderInput form={form} name="outputFolderPath">
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
