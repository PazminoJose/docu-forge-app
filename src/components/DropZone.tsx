import { ActionIcon, Group, Text } from "@mantine/core";
import {
  Dropzone as MantineDropZone,
  type DropzoneProps as MantineDropzoneProps,
} from "@mantine/dropzone";
import {
  IconCheckbox,
  IconFile,
  IconUpload,
  IconX
} from "@tabler/icons-react";
import { MouseEvent, ReactNode, useRef, useState } from "react";

interface DropZoneProps extends Partial<MantineDropzoneProps> {
  label: string;
  description?: string;
  idleIcon?: ReactNode;
  onFileSelect?: (file: File | null) => void;
}

const MIN_HEIGHT_DROP_ZONE = 150;
const MAX_FILES = 1;
const ICON_SIZE = 52;
const STROKE = 1.5;

export function DropZone({
  label,
  description,
  idleIcon,
  onFileSelect,
  ...props
}: DropZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const openRef = useRef<() => void>(null);

  const handleDrop = (files: File[]) => {
    setFile(files[0]);
    onFileSelect?.(files[0]);
  };

  const handleRemoveFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect?.(null);
  };

  const IdleIcon = () => {
    if (file) {
      return <IconCheckbox size={ICON_SIZE} color="var(--mantine-color-green-6)" stroke={STROKE} />
    } else if (idleIcon) {
      return idleIcon;
    } else {
      return <IconFile size={ICON_SIZE} color="var(--mantine-color-dimmed)" stroke={STROKE} />
    }
  }

  const DropZoneContent = () => {
    if (file) {
      return (<div className="flex items-start gap-4">
        <Text size="sm" c="green" inline mt={7}>
          {file.name}
        </Text>
        <ActionIcon
          onClick={handleRemoveFile}
          variant="filled"
          color="red"
          size="md"
          style={{ pointerEvents: "all" }}
        >
          <IconX size={ICON_SIZE} stroke={STROKE} />
        </ActionIcon>
      </div>)
    } else {
      return (
        <div>
          <Text size="xl" inline>
            {label}
          </Text>
          <Text size="sm" c="dimmed" inline className="mt-2">
            {description}
          </Text>
        </div>)
    }
  }

  return (
    <MantineDropZone
      openRef={openRef}
      maxFiles={MAX_FILES}
      onDrop={handleDrop}
      {...props}
    >
      <Group
        justify="center"
        gap="xl"
        mih={MIN_HEIGHT_DROP_ZONE}
        style={{ pointerEvents: "none" }}
      >
        <MantineDropZone.Accept>
          <IconUpload
            size={ICON_SIZE}
            color="var(--mantine-color-blue-6)"
            stroke={STROKE}
          />
        </MantineDropZone.Accept>
        <MantineDropZone.Reject>
          <IconX
            size={ICON_SIZE}
            color="var(--mantine-color-red-6)"
            stroke={STROKE}
          />
        </MantineDropZone.Reject>
        <MantineDropZone.Idle>
          <IdleIcon />
        </MantineDropZone.Idle>
        <DropZoneContent />
      </Group>
    </MantineDropZone>
  );
}
