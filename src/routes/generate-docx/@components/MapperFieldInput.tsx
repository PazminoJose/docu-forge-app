import {
	ActionIcon,
	type ActionIconProps,
	Card,
	Checkbox,
	type CheckboxProps,
	type PolymorphicComponentProps,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { IconTableOptions, IconTablePlus, IconX } from "@tabler/icons-react";
import type { ChangeEvent } from "react";

interface Props {
	disabled?: boolean;
	value?: string;
	onChange?: (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;
	error?: string;
	label?: string;
	mapperTooltip?: string;
	filterTooltip?: string;
	checkboxProps?: CheckboxProps;
	mapperButtonProps?: PolymorphicComponentProps<"button", ActionIconProps>;
	filterButtonProps?: ActionIconProps;
	showFilterMapping?: boolean;
	showRemoveMapping?: boolean;
	onMapToColumn?: () => void;
	onMapFilters?: () => void;
	onRemoveMapping?: () => void;
}

export default function MapperFieldInput({
	disabled,
	value,
	onChange,
	error,
	label,
	mapperTooltip,
	filterTooltip,
	checkboxProps,
	mapperButtonProps,
	filterButtonProps,
	showFilterMapping,
	showRemoveMapping,
	onRemoveMapping,
}: Props) {
	return (
		<Card
			className="flex flex-col gap-1"
			withBorder
			radius="md"
			p="sm"
			shadow="sm"
		>
			<TextInput
				value={value}
				disabled={disabled}
				label={label}
				placeholder="Ingresa el valor o mapea a una columna"
				error={error}
				onChange={onChange}
			/>
			<div className="flex items-center gap-2">
				<Tooltip label={mapperTooltip}>
					<ActionIcon
						{...mapperButtonProps}
						color="green"
						aria-label="Settings"
					>
						<IconTablePlus className="h-[70%] w-[70%]" stroke={1.5} />
					</ActionIcon>
				</Tooltip>

				{showFilterMapping && (
					<Tooltip label={filterTooltip}>
						<ActionIcon
							{...filterButtonProps}
							color="yellow"
							aria-label="Settings"
						>
							<IconTableOptions className="h-[70%] w-[70%]" stroke={1.5} />
						</ActionIcon>
					</Tooltip>
				)}

				{showRemoveMapping && (
					<Tooltip label="Quitar mapeo">
						<ActionIcon
							onClick={onRemoveMapping}
							color="red"
							aria-label="Settings"
						>
							<IconX className="h-[70%] w-[70%]" stroke={1.5} />
						</ActionIcon>
					</Tooltip>
				)}
				<Checkbox label="Usar como nombre" {...checkboxProps} />
			</div>
		</Card>
	);
}
