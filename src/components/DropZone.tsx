import { Group, Text } from '@mantine/core';
import { type DropzoneProps, Dropzone as MantineDropZone } from '@mantine/dropzone';
import { Image, Upload, X } from "lucide-react";

export function DropZone(props: Partial<DropzoneProps>) {
  return (
    <MantineDropZone
      onDrop={(files) => console.log('accepted files', files)}
      onReject={(files) => console.log('rejected files', files)}
      {...props}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
        <MantineDropZone.Accept>
          <Upload size={52} color="var(--mantine-color-blue-6)" stroke="1.5" />
        </MantineDropZone.Accept>
        <MantineDropZone.Reject>
          <X size={52} color="var(--mantine-color-red-6)" stroke="1.5" />
        </MantineDropZone.Reject>
        <MantineDropZone.Idle>
          <Image size={52} color="var(--mantine-color-dimmed)" stroke="1.5" />
        </MantineDropZone.Idle>

        <div>
          <Text size="xl" inline>
            Drag images here or click to select files
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Attach as many files as you like, each file should not exceed 5mb
          </Text>
        </div>
      </Group>
    </MantineDropZone>
  );
}