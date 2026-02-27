import { ActionIcon, Text } from "@mantine/core";
import { IconFolder, IconX } from "@tabler/icons-react";
import { appDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { formatDisplayPath } from "@utils/formatDisplayPath";
import { ReactNode } from "react";

const ICON_SIZE = 24;
const MAX_PATH_LENGTH = 400;

interface FileButtonInputProps {
	formatDisplayFunction?: (path: string) => string;
	extensions?: string[];
	children?: ReactNode;
	value?: string;
	error?: string;
	onChange?: (value: string) => void;
}

export default function FileButtonInput({
	extensions,
	value,
	error,
	onChange,
	formatDisplayFunction,
}: FileButtonInputProps) {
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

	const handleClear = () => {
		onChange?.("");
	};

	return (
		<div className="flex w-full justify-center gap-2">
			{value ? (
				<ActionIcon onClick={handleClear} color="red">
					<IconX size={ICON_SIZE} />
				</ActionIcon>
			) : (
				<ActionIcon onClick={handleOnClick}>
					<IconFolder size={ICON_SIZE} />
				</ActionIcon>
			)}
			{value && (
				<Text
					size="sm"
					className="self-center truncate"
					style={{ maxWidth: `${MAX_PATH_LENGTH}px` }}
				>
					{formatDisplayFunction
						? formatDisplayFunction(value)
						: formatDisplayPath(value)}
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
