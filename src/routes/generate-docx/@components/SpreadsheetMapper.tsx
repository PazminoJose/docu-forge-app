import { Alert, Button, Loader, Table } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@utils/cn";
import { useState } from "react";
import { toast } from "sonner";
import { type SpreadsheetData, useGetSheetData } from "../@services/queries";

export type Mapping = {
	column: string | null;
	sheet: string | null;
};

interface SpreadsheetMapperProps {
	initialSelection: Mapping | null;
	onSave: (savedMapping: Mapping) => void;
}

export default function SpreadsheetMapper({
	initialSelection,
	onSave,
}: SpreadsheetMapperProps) {
	const [selectedData, setSelectedData] = useState<SpreadsheetData | null>(
		null,
	);
	const [selectedColumn, setSelectedColumn] = useState<string | null>(
		initialSelection ? initialSelection.column : null,
	);
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const { data: spreadSheetData, isLoading } = useGetSheetData(dataFilePath);

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
			sheet: selectedData?.sheet || null,
		});
		toast.success(`Columna ${selectedColumn} seleccionada correctamente`);
		modals.closeAll();
	};

	const handleSelectSheetData = (sheet: SpreadsheetData) => {
		setSelectedData(sheet);
	};

	const rows = selectedData?.data?.map((row, index) => (
		<Table.Tr key={`row-${index}-${row.join("-")}`}>
			{row.map((cell, cellIndex) => (
				<Table.Td
					key={`cell-${cellIndex}-${cell}`}
					className={cn(
						"text-center",
						selectedColumn === cell.column && "bg-blue-500/60 text-white",
					)}
				>
					{cell.value}
				</Table.Td>
			))}
		</Table.Tr>
	));

	useShallowEffect(() => {
		if (initialSelection?.sheet) {
			const initialSheet = spreadSheetData?.find(
				(sheet) => sheet.sheet === initialSelection.sheet,
			);
			if (initialSheet) {
				setSelectedData(initialSheet);
			}
		} else if (spreadSheetData && spreadSheetData.length > 0) {
			const initialSheet = spreadSheetData[0];
			setSelectedData(initialSheet);
		}
	}, [spreadSheetData]);

	return isLoading ? (
		<div className="flex h-full max-h-[75vh] items-center justify-center">
			<Loader size="lg" />
		</div>
	) : (
		<div className="flex h-full max-h-[75vh] flex-col">
			<Alert mb="md" color="yellow" icon={<IconInfoCircle />}>
				Si seleccionas diferentes hojas para cada campo asegúrate que tengan el
				mismo tamaño configurado en la sección de rango, si no podrías obtener
				resultados inesperados o errores durante el proceso de generación.
			</Alert>
			<div className="flex-1 overflow-auto">
				<Table withColumnBorders withRowBorders withTableBorder stickyHeader>
					<Table.Thead>
						<Table.Tr>
							{spreadSheetData &&
								spreadSheetData.length > 0 &&
								selectedData?.data[0].map((row) => (
									<Table.Th
										className={cn(
											"min-w-40 max-w-40 cursor-pointer bg-gray-100 text-center",
											selectedColumn === row.column && "bg-blue-500 text-white",
										)}
										key={row.column}
										onClick={() => handleSelectColumn(row.column)}
									>
										{row.column}
									</Table.Th>
								))}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody> {rows}</Table.Tbody>
				</Table>
			</div>
			<div className="flex gap-2 p-2">
				{spreadSheetData?.map((row, index) => (
					<Button
						variant={selectedData?.sheet === row.sheet ? "filled" : "outline"}
						key={`${index}-${row.sheet}`}
						onClick={() => handleSelectSheetData(row)}
					>
						{row.sheet}
					</Button>
				))}
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
