import { createFileRoute } from "@tanstack/react-router";
import FileSelectionForm from "./@componentes/FileSelectionForm/FileSelectionForm";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return <FileSelectionForm />;
}
