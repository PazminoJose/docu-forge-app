import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "./@components/AppShell";

export const Route = createFileRoute("/create-document")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AppShell />;
}
