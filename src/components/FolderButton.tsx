import { Button, Text } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { open } from "@tauri-apps/plugin-dialog";
import { ReactNode, useState } from "react";

const ICON_SIZE = 24;
const MAX_PATH_LENGTH = 400;

interface FolderButtonProps {
    children?: ReactNode;
    handleSelectOutputFolder: (path: string) => void;
}

export default function FolderButton({ children, handleSelectOutputFolder }: FolderButtonProps) {
    const [folderPath, setFolderPath] = useState<string | null>(null);

    const handleOnClick = async () => {
        const folderPath = await open({ directory: true });
        if (folderPath != null) {
            setFolderPath(folderPath)
            handleSelectOutputFolder(folderPath);
        }
    }
    return <div className="flex flex-col gap-2 justify-center w-full">
        <Button onClick={handleOnClick} leftSection={<IconFolder size={ICON_SIZE} />} variant="filled" className="mx-auto">
            {children}
        </Button>
        {folderPath && <Text size="sm" className="self-center truncate" style={{ maxWidth: `${MAX_PATH_LENGTH}px` }}>{folderPath}</Text>}
    </div>
}