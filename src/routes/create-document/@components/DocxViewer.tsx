import { useAppState } from "@stores/app.store";
import { invoke } from "@tauri-apps/api/core";
import * as docx from "docx-preview";
import { useCallback, useEffect, useRef } from "react";

export default function DocxViewer() {
	const templateDocumentPath = useAppState((state) => state.templateFilePath);
	const containerRef = useRef<HTMLDivElement>(null);

	const getTemplateDocument = useCallback(async () => {
		if (templateDocumentPath && containerRef.current) {
			const res = await invoke<number[]>("get_file", {
				filePath: templateDocumentPath,
			});
			const buffer = new Uint8Array(res);
			docx.renderAsync(buffer, containerRef.current);
		}
	}, [templateDocumentPath]);

	useEffect(() => {
		getTemplateDocument();
	}, [getTemplateDocument]);

	return <section aria-label="Document preview" ref={containerRef} className="h-full w-full"></section>;
}
