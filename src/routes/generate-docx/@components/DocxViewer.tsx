import { Skeleton } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { useAppState } from "@stores/app.store";
import * as docx from "docx-preview";
import { useRef } from "react";
import { useGetDocxFile } from "../@services/queries";

export default function DocxViewer() {
	const templateDocumentPath = useAppState((state) => state.templateFilePath);
	const { data, isLoading } = useGetDocxFile(templateDocumentPath);
	const containerRef = useRef<HTMLDivElement>(null);

	useShallowEffect(() => {
		if (templateDocumentPath && containerRef.current && data) {
			const buffer = new Uint8Array(data);
			docx.renderAsync(buffer, containerRef.current);
		}
	}, [data]);

	if (!templateDocumentPath) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-gray-500">Previsualización no disponible</p>
			</div>
		);
	}

	return isLoading ? (
		<Skeleton className="h-full w-full" />
	) : (
		<section
			aria-label="Document preview"
			ref={containerRef}
			className="h-full w-full"
		></section>
	);
}
