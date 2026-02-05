import { Text } from "@mantine/core";
import {
  MS_EXCEL_MIME_TYPE,
  MS_WORD_MIME_TYPE,
  PDF_MIME_TYPE,
} from "@mantine/dropzone";
import { IconFileFilled, IconFileSpreadsheet } from "@tabler/icons-react";
import { DropZone } from "../components/DropZone";
import FolderButton from "../components/FolderButton";
import { useAppState } from "../providers/AppStateProvider";
export default function FileSelection() {

  const { setOutputFolderPath } = useAppState();

  const handleSelectDataFile = async (file: File | null) => {
  }

  const handleSelectTemplateFile = async (file: File | null) => {
  }

  const handleSelectOutputFolder = async (folderPath: string) => {
    setOutputFolderPath(folderPath)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <IconFileFilled size={64} className="mx-auto text-primary-500" />
        <Text className="text-center text-2xl font-semibold">
          Generador de documentos
        </Text>
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
        label="Seleccione o arrastre un archivo PDF o WORD aquí"
        description="Solo se permite un archivo"
        accept={[...MS_WORD_MIME_TYPE, ...PDF_MIME_TYPE]}
      />
      <FolderButton handleSelectOutputFolder={handleSelectOutputFolder}>
        Seleccione en donde guardar los documentos generados
      </FolderButton>
    </div>
  );
}
