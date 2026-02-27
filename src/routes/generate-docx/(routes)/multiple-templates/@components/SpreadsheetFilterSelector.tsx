import { Button, Loader, Table } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { cn } from "@utils/cn";
import { parseNumberToColumn } from "@utils/parseNumberToColumn";
import { useState } from "react";
import { toast } from "sonner";
import { useGetSheetData } from "src/routes/generate-docx/@services/queries";

export type SpreadsheetColumnFilter = {
	column: string;
	label: string;
	index: number;
};

interface SpreadsheetFiltersProps {
	initialSelection?: SpreadsheetColumnFilter[];
	onSave: (savedMapping: SpreadsheetColumnFilter[]) => void;
}

export default function SpreadsheetFiltersSelector({
	initialSelection = [],
	onSave,
}: SpreadsheetFiltersProps) {
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const { data: spreadSheetData, isLoading } = useGetSheetData(dataFilePath);

	const [selectedColumn, setSelectedColumn] =
		useState<SpreadsheetColumnFilter[]>(initialSelection);

	const handleSelectColumn = (index: number) => {
		const isSelected = selectedColumn.some((col) => col.index === index);
		if (isSelected) {
			setSelectedColumn((prev) => prev.filter((col) => col.index !== index));
		} else {
			setSelectedColumn((prev) => [
				...prev,
				{
					column: parseNumberToColumn(index),
					index,
					label: spreadSheetData ? spreadSheetData[0].data[0][index].value : "",
				},
			]);
		}
	};

	const handleSave = () => {
		onSave(selectedColumn);
		toast.success(
			`Columna ${selectedColumn.map((col) => col.column).join(", ")} seleccionada correctamente`,
		);
		modals.closeAll();
	};

	const rows = spreadSheetData?.[0].data.slice(0, 1)?.map((row, index) => (
		<Table.Tr key={`row-${index}-${row.join("-")}`}>
			{row.map((cell, cellIndex) => (
				<Table.Td
					key={`cell-${cellIndex}-${cell}`}
					className={cn(
						"text-center",
						selectedColumn.some((col) => col.index === cellIndex) &&
							"bg-blue-500/60 text-white",
					)}
				>
					{cell.value}
				</Table.Td>
			))}
		</Table.Tr>
	));

	return isLoading ? (
		<div className="flex h-full max-h-[75vh] items-center justify-center">
			<Loader size="lg" />
		</div>
	) : (
		<div className="flex h-full max-h-[75vh] flex-col">
			<div className="flex-1 overflow-auto">
				<Table withColumnBorders withRowBorders withTableBorder stickyHeader>
					<Table.Thead>
						<Table.Tr>
							{spreadSheetData &&
								spreadSheetData.length > 0 &&
								spreadSheetData[0].data[0].map((_, index) => (
									<Table.Th
										className={cn(
											"min-w-40 max-w-40 cursor-pointer bg-gray-100 text-center",
											selectedColumn.some((col) => col.index === index) &&
												"bg-blue-500 text-white",
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
