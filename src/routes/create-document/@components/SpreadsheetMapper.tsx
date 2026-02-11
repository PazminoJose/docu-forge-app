import { Button, NumberInput, Table } from "@mantine/core";
import { modals } from "@mantine/modals";
import { cn } from "@utils/cn";
import { parseNumberToColumn } from "@utils/parseNumberToColumn";
import { useState } from "react";

export type SpreadsheetData = string[][];

interface SpreadsheetMapperProps {
	data: SpreadsheetData;
	onColumnSelect: (columnIndex: number | null) => void;
	range: {
		from: number;
		to: number;
	};
}

export default function SpreadsheetMapper({ data, range, onColumnSelect }: SpreadsheetMapperProps) {
	const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
	const [from, setFrom] = useState<number>(range.from);
	const [to, setTo] = useState<number>(range.to);

	const handleSelectColumn = (columnIndex: number) => {
		if (selectedColumn === columnIndex) {
			setSelectedColumn(null);
			onColumnSelect(null);
		} else {
			setSelectedColumn(columnIndex);
			onColumnSelect(columnIndex);
		}
	};

	const rows = data.map((row, index) => (
		<Table.Tr key={`row-${index}-${row.join("-")}`}>
			{row.map((cell, cellIndex) => (
				<Table.Td
					key={`cell-${cellIndex}-${cell}`}
					className={cn("text-center", selectedColumn === cellIndex && "bg-blue-500/60 text-white")}
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
											selectedColumn === index && "bg-blue-500 text-white",
										)}
										key={parseNumberToColumn(index)}
										onClick={() => handleSelectColumn(index)}
									>
										{parseNumberToColumn(index)}
									</Table.Th>
								))}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</div>

			<div className="flex shrink-0 justify-end pt-4">
				<Button variant="outline">Aceptar</Button>
				<Button onClick={() => modals.closeAll()} variant="outline">
					Cancelar
				</Button>
			</div>
		</div>
	);
}
