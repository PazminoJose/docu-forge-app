import { Button, Progress } from "@mantine/core";
import { IconFileFilled } from "@tabler/icons-react";

interface ProcessActionGroupProps {
	loading: boolean;
	progress: number;
	onCancel: () => void;
	label?: string;
}

export const ProcessActionControls = ({
	loading,
	progress,
	onCancel,
	label = "Generar",
}: ProcessActionGroupProps) => {
	return (
		<section className="flex flex-col gap-2">
			{loading && <Progress value={progress} />}
			<Button type="submit" leftSection={<IconFileFilled />} loading={loading}>
				{label}
			</Button>
			{loading && (
				<Button color="red" onClick={onCancel}>
					Cancelar
				</Button>
			)}
		</section>
	);
};
