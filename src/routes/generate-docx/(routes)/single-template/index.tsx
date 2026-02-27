import { createFileRoute } from "@tanstack/react-router";
import GenerateSingleDocxOptions from "./@components/GenerateSingleDocx/GenerateSingleDocxOptions";

export const Route = createFileRoute("/generate-docx/(routes)/single-template/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <GenerateSingleDocxOptions />;
}
