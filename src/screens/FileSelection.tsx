import {
  MS_EXCEL_MIME_TYPE,
  MS_WORD_MIME_TYPE,
  PDF_MIME_TYPE,
} from "@mantine/dropzone";
import { DropZone } from "../components/DropZone";

export default function FileSelection() {
  return (
    <div>
      <DropZone
        label="Seleccione o arrastre un archivo EXCEL aquí"
        description="Solo se permite un archivo"
        accept={MS_EXCEL_MIME_TYPE}
      />
      <DropZone
        label="Seleccione o arrastre un archivo PDF o WORD aquí"
        description="Solo se permite un archivo"
        accept={[...MS_WORD_MIME_TYPE, ...PDF_MIME_TYPE]}
      />
    </div>
  );
}
