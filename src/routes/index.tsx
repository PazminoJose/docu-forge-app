import { Button, Text } from "@mantine/core";
import { MS_EXCEL_MIME_TYPE, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { IconArrowBigRightFilled, IconFileFilled, IconFileSpreadsheet } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { DropZone } from "../@components/DropZone";
import FolderButton from "../@components/FolderButton";
import { useAppState } from "../@providers/AppStateProvider";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { setOutputFolderPath, setDocumentTemplate, setDataFile } = useAppState();
	const router = useRouter();

	const handleSelectDataFile = async (file: File | null) => {
		console.log(file);
		if (file) setDataFile(file);
	};

	const handleSelectTemplateFile = async (file: File | null) => {
		if (file) setDocumentTemplate(file);
	};

	const handleSelectOutputFolder = async (folderPath: string) => {
		setOutputFolderPath(folderPath);
	};

	const handleContinue = () => {
		router.navigate({
			to: "/create-document",
		});
	};

	return (
		<div className="flex h-full flex-col gap-4 py-4">
			<div className="flex flex-col">
				<IconFileFilled size={64} className="mx-auto text-primary-500" />
				<Text className="text-center font-semibold text-2xl">Generador de documentos</Text>
				<Text className="text-center text-base text-gray-600">
					Genera documentos en masa a partir de archivos de datos y plantillas.
				</Text>
			</div>
			<DropZone
				onFileSelect={handleSelectDataFile}
				idleIcon={<IconFileSpreadsheet size={52} stroke={1.5} color="var(--mantine-color-dimmed)" />}
				label="Seleccione o arrastre un archivo EXCEL aquí"
				description="Solo se permite un archivo"
				accept={MS_EXCEL_MIME_TYPE}
			/>
			<DropZone
				onFileSelect={handleSelectTemplateFile}
				label="Seleccione o arrastre una plantilla PDF o WORD aquí"
				description="Solo se permite un archivo"
				accept={[...MS_WORD_MIME_TYPE, ...PDF_MIME_TYPE]}
			/>
			<FolderButton handleSelectOutputFolder={handleSelectOutputFolder}>
				Seleccione en donde guardar los documentos generados
			</FolderButton>
			<div className="mx-auto">
				<Button
					onClick={handleContinue}
					className="bg-primary-500"
					rightSection={<IconArrowBigRightFilled />}
				>
					Continuar
				</Button>
			</div>
		</div>
	);
}
