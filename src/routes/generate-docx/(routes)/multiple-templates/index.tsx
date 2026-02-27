import { createFileRoute } from "@tanstack/react-router";
import GenerateMultipleDocxOptions from "./@components/GenerateMultipleDocx/GenerateMultipleDocxOptions";

export const Route = createFileRoute(
	"/generate-docx/(routes)/multiple-templates/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <GenerateMultipleDocxOptions />;
}
