import { Button, Text } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { appDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { formatDisplayPath } from "@utils/formatDisplayPath";
import { type ReactNode } from "react";

const ICON_SIZE = 24;
const MAX_PATH_LENGTH = 400;

interface FolderButtonProps {
	extensions?: string[];
	children?: ReactNode;
	value?: string;
	error?: string;
	onChange?: (value: string) => void;
}

export default function FileInput({ extensions, value, error, onChange, children }: FolderButtonProps) {
	const handleOnClick = async () => {
		const folderPath = await open({
			filters: [{ name: "Files", extensions: extensions ?? ["*"] }],
			title: "Selecciona un archivo",
			defaultPath: await appDataDir(),
		});
		if (folderPath != null) {
			onChange?.(folderPath);
		}
	};

	return (
		<div className="flex w-full flex-col justify-center gap-2">
			<Button
				onClick={handleOnClick}
				leftSection={<IconFolder size={ICON_SIZE} />}
				variant="filled"
				className="mx-auto bg-secondary-900"
			>
				{children}
			</Button>
			{value && (
				<Text size="sm" className="self-center truncate" style={{ maxWidth: `${MAX_PATH_LENGTH}px` }}>
					{formatDisplayPath(value)}
				</Text>
			)}
			{error && (
				<Text size="sm" c="red" className="self-center">
					{error}
				</Text>
			)}
		</div>
	);
}
