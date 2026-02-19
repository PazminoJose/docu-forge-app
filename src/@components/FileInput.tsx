import { Button, Text } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconFolder } from "@tabler/icons-react";
import { appDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { formatDisplayPath } from "@utils/formatDisplayPath";
import type { FormPathValue } from "node_modules/@mantine/form/lib/paths.types";
import type { ReactNode } from "react";

const ICON_SIZE = 24;
const MAX_PATH_LENGTH = 400;

interface FolderButtonProps<T> {
	form: UseFormReturnType<T>;
	name: keyof T;
	extensions?: string[];
	children?: ReactNode;
}

export default function FileInput<T>({ form, name, extensions, children }: FolderButtonProps<T>) {
	const handleOnClick = async () => {
		const folderPath = await open({
			filters: [{ name: "Files", extensions: extensions ?? ["*"] }],
			title: "Selecciona un archivo",
			defaultPath: await appDataDir(),
		});
		if (folderPath != null) {
			form.setFieldValue(name as string, folderPath as FormPathValue<T, string>);
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
			{form.getValues()[name] && (
				<Text size="sm" className="self-center truncate" style={{ maxWidth: `${MAX_PATH_LENGTH}px` }}>
					{formatDisplayPath(form.getValues()[name] as string)}
				</Text>
			)}
			{form.errors[name as string] && (
				<Text size="sm" c="red" className="self-center">
					{form.errors[name as string]}
				</Text>
			)}
		</div>
	);
}
