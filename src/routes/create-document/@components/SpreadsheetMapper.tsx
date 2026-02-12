import { Button, NumberInput, Table } from "@mantine/core";
import { modals } from "@mantine/modals";
import { cn } from "@utils/cn";
import { parseNumberToColumn } from "@utils/parseNumberToColumn";
import { useState } from "react";

export type SpreadsheetData = string[][];

export type Range = {
	from: number;
	to: number;
};

export type Mapping = {
	column: string | null;
	range: Range;
};

interface SpreadsheetMapperProps {
	initialSelection: Mapping | null;
	data: SpreadsheetData;
	onSave: (savedMapping: Mapping) => void;
	range: Range;
}

export default function SpreadsheetMapper({
	initialSelection,
	data,
	range,
	onSave,
}: SpreadsheetMapperProps) {
	const [selectedColumn, setSelectedColumn] = useState<string | null>(
		initialSelection ? initialSelection.column : null,
	);
	const [from, setFrom] = useState<number>(initialSelection ? initialSelection.range.from : range.from);
	const [to, setTo] = useState<number>(initialSelection ? initialSelection.range.to : range.to);

	const handleSelectColumn = (column: string) => {
		if (selectedColumn === column) {
			setSelectedColumn(null);
		} else {
			setSelectedColumn(column);
		}
	};

	const handleSave = () => {
		onSave({
			column: selectedColumn,
			range: {
				from,
				to,
			},
		});
		modals.closeAll();
	};

	const rows = data.map((row, index) => (
		<Table.Tr key={`row-${index}-${row.join("-")}`}>
			{row.map((cell, cellIndex) => (
				<Table.Td
					key={`cell-${cellIndex}-${cell}`}
					className={cn(
						"text-center",
						selectedColumn === parseNumberToColumn(cellIndex) && "bg-blue-500/60 text-white",
					)}
				>
					{cell}
				</Table.Td>
			))}
		</Table.Tr>
	));

	return (
		<div className="flex h-full max-h-[75vh] flex-col">
			<div className="flex shrink-0 gap-2 pb-4">
				<NumberInput
					placeholder="Desde"
					label="Desde"
					min={1}
					value={from}
					onChange={(value) => setFrom(parseInt(value.toString()))}
				/>
				<NumberInput
					placeholder="Hasta"
					label="Hasta"
					min={1}
					value={to}
					onChange={(value) => setTo(parseInt(value.toString()))}
				/>
			</div>
			<div className="flex flex-1 justify-center overflow-auto">
				<Table withColumnBorders withRowBorders withTableBorder stickyHeader className="w-fit">
					<Table.Thead>
						<Table.Tr>
							{data &&
								data.length > 0 &&
								data[0].map((_, index) => (
									<Table.Th
										className={cn(
											"min-w-40 max-w-40 cursor-pointer bg-gray-100 text-center",
											selectedColumn === parseNumberToColumn(index) && "bg-blue-500 text-white",
										)}
										key={parseNumberToColumn(index)}
										onClick={() => handleSelectColumn(parseNumberToColumn(index))}
									>
										{parseNumberToColumn(index)}
									</Table.Th>
								))}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</div>

			<div className="flex gap-2 shrink-0 justify-end pt-4">
				<Button color="green" onClick={handleSave}>
					Guardar
				</Button>
				<Button onClick={() => modals.closeAll()} color="red" variant="outline">
					Cancelar
				</Button>
			</div>
		</div>
	);
}
