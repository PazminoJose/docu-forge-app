import { useAppState } from "@stores/app.store";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { envs } from "src/@config/envs";
import type { GenerateSingleDocxSchema } from "../@components/GenerateSingleDocx/generateSingleDocxSchema";

export default function useProcessDocxSocket() {
	const templateFilePath = useAppState((state) => state.templateFilePath);
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const outputFolderPath = useAppState((state) => state.outputFolderPath);
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const socketRef = useRef<WebSocket | null>(null);

	const processDocx = (values: GenerateSingleDocxSchema) => {
		socketRef.current = new WebSocket(`${envs.WEB_SOCKET_URL}/process-docx`);
		if (socketRef.current != null) {
			socketRef.current.onopen = () => {
				setLoading(true);
				socketRef.current?.send(
					JSON.stringify({
						action: "start",
						docx_path: templateFilePath,
						xlsx_path: dataFilePath,
						output_folder: outputFolderPath,
						skip_header: values.skipHeader,
						range: values.range,
						fields: values.fields,
						apply_to_all_sheets: values.applyToAllSheets,
						merge_generated_files: values.mergeGeneratedFiles,
					}),
				);
			};

			socketRef.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.status === "progress") {
					setProgress(data.percent);
				} else if (data.status === "completed") {
					setLoading(false);
					socketRef.current?.close();
					toast.success("Proceso completado exitosamente");
					setProgress(100);
				}
			};
		}
	};

	function cancelProcess() {
		if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			socketRef.current.close();
		}
		setProgress(0);
		setLoading(false);
		toast.warning("Proceso cancelado por el usuario");
		socketRef.current = null;
	}

	return {
		loading,
		socketRef,
		progress,
		processDocx,
		cancelProcess,
	};
}
