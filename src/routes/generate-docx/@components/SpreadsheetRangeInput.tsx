import {
	ActionIcon,
	type ActionIconProps,
	Menu,
	NumberInput,
	type NumberInputProps,
	type PolymorphicComponentProps,
} from "@mantine/core";
import { useSetState, useShallowEffect } from "@mantine/hooks";
import { useAppState } from "@stores/app.store";
import { IconTableFilled } from "@tabler/icons-react";
import { type SelectHTMLAttributes } from "react";
import { useGetSheetRange } from "../@services/queries";

interface Props {
	disable?: boolean;
	fromProps?: NumberInputProps;
	toProps?: NumberInputProps;
	containerProps?: SelectHTMLAttributes<HTMLElement>;
	actionProps?: PolymorphicComponentProps<"button", ActionIconProps>;
}

export default function SpreadsheetRangeInput({
	disable,
	fromProps,
	toProps,
	containerProps,
	actionProps,
}: Props) {
	const [state, setState] = useSetState({
		sheet: "",
		from: 0,
		to: 0,
	});
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const { data: spreadSheetRange } = useGetSheetRange(dataFilePath);

	const handleChangeSheet = (sheet: string) => {
		setState({ sheet });
		const range = spreadSheetRange?.find((s) => s.sheet === sheet)?.range;
		if (range) {
			setState({ from: range.from, to: range.to });
			fromProps?.onChange?.(range.from);
			toProps?.onChange?.(range.to);
		}
	};

	useShallowEffect(() => {
		if (spreadSheetRange && spreadSheetRange.length > 0) {
			const range = spreadSheetRange[0].range;
			const sheet = spreadSheetRange[0].sheet;
			setState({ from: range.from, to: range.to, sheet });
			fromProps?.onChange?.(range.from);
			toProps?.onChange?.(range.to);
		}
	}, [spreadSheetRange]);

	return (
		<div className="flex items-center gap-2" {...containerProps}>
			<NumberInput
				disabled={disable}
				label="Desde"
				placeholder="Desde"
				{...fromProps}
				value={state.from}
				onChange={(value) => {
					if (value && typeof value === "number") {
						setState({ from: value });
						fromProps?.onChange?.(value);
					}
				}}
			/>
			<NumberInput
				disabled={disable}
				label="Hasta"
				placeholder="Hasta"
				{...toProps}
				value={state.to}
				onChange={(value) => {
					if (value && typeof value === "number") {
						setState({ to: value });
						toProps?.onChange?.(value);
					}
				}}
			/>
			<Menu>
				<Menu.Target>
					<ActionIcon
						disabled={disable}
						className="mb-1 self-end"
						{...actionProps}
					>
						<IconTableFilled size={20} />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					{spreadSheetRange &&
						spreadSheetRange.length > 0 &&
						spreadSheetRange.map((spreadSheet) => (
							<Menu.Item
								c={state.sheet === spreadSheet.sheet ? "blue" : undefined}
								key={spreadSheet.sheet}
								onClick={() => handleChangeSheet(spreadSheet.sheet)}
							>
								{spreadSheet.sheet}
							</Menu.Item>
						))}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
}
