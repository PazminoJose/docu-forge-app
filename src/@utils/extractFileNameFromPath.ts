export function extractFileNameFromPath(filePath: string): string {
	const parts = filePath.split(/[/\\]/);
	return parts[parts.length - 1];
}
