import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/create-document/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div></div>;
}
