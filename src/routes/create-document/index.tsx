import { createFileRoute } from "@tanstack/react-router";
import DocxViewer from "./@components/DocxViewer";

export const Route = createFileRoute("/create-document/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <DocxViewer />;
}
