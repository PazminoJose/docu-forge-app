import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import FileSelectionForm from "./@componentes/FileSelectionForm/FileSelectionForm";

export const Route = createFileRoute("/")({
	component: Index,
	beforeLoad: async () => {
		await invoke("clear_app_data");
	},
});

function Index() {
	return <FileSelectionForm />;
}
