const MAX_PATH_LENGTH = 50;

export function formatDisplayPath(path: string) {
	if (path.length <= MAX_PATH_LENGTH) {
		return path;
	}
	const end = path.slice(-MAX_PATH_LENGTH);
	return `...${end}`;
}
