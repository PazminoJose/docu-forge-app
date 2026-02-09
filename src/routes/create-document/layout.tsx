import { createFileRoute } from "@tanstack/react-router";
import { CreateDocumentAppShell } from "./@components/CreateDocumentAppShell";

export const Route = createFileRoute("/create-document")({
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateDocumentAppShell />;
}
