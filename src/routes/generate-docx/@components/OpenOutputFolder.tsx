import { ActionIcon, Tooltip } from "@mantine/core";
import { useAppState } from "@stores/app.store";
import { IconFolderOpen } from "@tabler/icons-react";
import { openPath } from "@tauri-apps/plugin-opener";

export default function OpenOutputFolder() {
	const outputFolderPath = useAppState((state) => state.outputFolderPath);

	const handleOpenOutputFolder = async () => {
		await openPath(outputFolderPath);
	};

	return (
		<ActionIcon onClick={handleOpenOutputFolder}>
			<Tooltip label="Abrir Carpeta">
				<IconFolderOpen className="h-[70%] w-[70%]" stroke={1.5} />
			</Tooltip>
		</ActionIcon>
	);
}
