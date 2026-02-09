import { useAppState } from "@stores/app.store";
import { IconCopy } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import * as docx from "docx-preview";
import { useContextMenu } from "mantine-contextmenu";
import { useEffect, useRef } from "react";

export default function DocxViewer() {
	const documentTemplate = useAppState((state) => state.documentTemplate);
	const { showContextMenu } = useContextMenu();
	const containerRef = useRef<HTMLDivElement>(null);

	const handleGetSelectedText = async () => {
		const selection = window.getSelection();
		if (selection && documentTemplate) {
			const arrayBuffer = await documentTemplate.arrayBuffer();
			const bytes = new Uint8Array(arrayBuffer);
			const res = await invoke("edit_docx", {
				file: bytes,
			});
		}
	};

	useEffect(() => {
		if (containerRef.current && documentTemplate) {
			docx.renderAsync(documentTemplate.arrayBuffer(), containerRef.current);
		}
	}, [documentTemplate]);

	return (
		<section
			aria-label="Document preview"
			onContextMenu={showContextMenu([
				{
					key: "selectedText",
					icon: <IconCopy size={16} />,
					title: "Manejar",
					onClick: handleGetSelectedText,
				},
			])}
			ref={containerRef}
			className="h-full w-full"
		></section>
	);
}
