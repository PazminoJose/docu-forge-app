import { Button, Table } from "@mantine/core";
import { modals } from "@mantine/modals";
import { cn } from "@utils/cn";
import { parseNumberToColumn } from "@utils/parseNumberToColumn";
import { useState } from "react";

export type SpreadsheetData = string[][];

export type Mapping = {
	column: string | null;
};

interface SpreadsheetMapperProps {
	initialSelection: Mapping | null;
	data: SpreadsheetData;
	onSave: (savedMapping: Mapping) => void;
}

export default function SpreadsheetMapper({ initialSelection, data, onSave }: SpreadsheetMapperProps) {
	const [selectedColumn, setSelectedColumn] = useState<string | null>(
		initialSelection ? initialSelection.column : null,
	);

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
			<div className="flex-1 overflow-auto">
				<Table withColumnBorders withRowBorders withTableBorder stickyHeader>
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

			<div className="flex shrink-0 justify-end gap-2 pt-4">
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
