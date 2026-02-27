import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "./@components/AppShell";

export const Route = createFileRoute("/generate-docx")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AppShell />;
}
