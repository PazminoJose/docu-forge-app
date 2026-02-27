import FileButtonInput from "@components/FileButtonInput";
import { Alert, Button, Loader, Table } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useShallowEffect } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { IconInfoCircle, IconSortAscendingLetters } from "@tabler/icons-react";
import { cn } from "@utils/cn";
import { extractFileNameFromPath } from "@utils/extractFileNameFromPath";
import { parseNumberToColumn } from "@utils/parseNumberToColumn";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { useGetUniqueCombinations } from "../@services/queries";
import type { SpreadsheetColumnFilter } from "./SpreadsheetFilterSelector";

type UniqueCombination = { column: string; value: string }[];

export type TemplateMapping = {
	combination: UniqueCombination;
	templatePath: string;
};

interface Props {
	initialSelection?: TemplateMapping[];
	filters: SpreadsheetColumnFilter[];
	onSave?: (mapping: TemplateMapping[]) => void;
}

const filterTemplateMapperSchema = z.object({
	combinationToTemplateMap: z.array(
		z.object({
			combination: z.array(
				z.object({
					column: z.string(),
					value: z.string(),
				}),
			),
			templatePath: z.string().refine((value) => value !== "", {
				message: "Debe seleccionar una plantilla",
			}),
		}),
	),
});

type FilterTemplateMapperSchema = z.infer<typeof filterTemplateMapperSchema>;

const initialFilterTemplateMapperValues: FilterTemplateMapperSchema = {
	combinationToTemplateMap: [],
};

export default function SpreadsheetFilterTemplateMapper({
	initialSelection,
	filters,
	onSave,
}: Props) {
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const { data, isLoading } = useGetUniqueCombinations(dataFilePath, filters);
	const [uniqueCombinations, setUniqueCombinations] = useState<
		UniqueCombination[]
	>([]);

	const form = useForm({
		initialValues: initialFilterTemplateMapperValues,
		validate: zod4Resolver(filterTemplateMapperSchema),
	});

	const handleSort = (index: number) => {
		if (!uniqueCombinations) return;
		const sorted = [...uniqueCombinations].sort((a, b) => {
			const valueA = a[index].value || "";
			const valueB = b[index].value || "";
			return valueA.localeCompare(valueB);
		});
		setUniqueCombinations(sorted);
	};

	const handleSelectTemplate = (index: number, filePath: string) => {
		form.setFieldValue(
			`combinationToTemplateMap.${index}.templatePath`,
			filePath,
		);
		form.setFieldValue(
			`combinationToTemplateMap.${index}.combination`,
			uniqueCombinations ? uniqueCombinations[index] : [],
		);
	};

	const handleSubmit = (values: FilterTemplateMapperSchema) => {
		onSave?.(values.combinationToTemplateMap);
		toast.success(`Columna seleccionada correctamente`);
		modals.closeAll();
	};

	const rows = uniqueCombinations?.map((row, index) => (
		<Table.Tr key={`row-${index}-${row.join("-")}`}>
			{row.map((cell, cellIndex) => (
				<Table.Td
					key={`cell-${cellIndex}-${cell}`}
					className={cn("text-center")}
				>
					{cell.value}
				</Table.Td>
			))}
			<Table.Td className={cn("text-center")}>
				<FileButtonInput
					extensions={["docx"]}
					formatDisplayFunction={extractFileNameFromPath}
					{...form.getInputProps(
						`combinationToTemplateMap.${index}.templatePath`,
					)}
					onChange={(value) => handleSelectTemplate(index, value)}
				/>
			</Table.Td>
		</Table.Tr>
	));

	useShallowEffect(() => {
		if (data) {
			setUniqueCombinations(data);
			form.setFieldValue(
				"combinationToTemplateMap",
				data.map((combination, i) => ({
					combination,
					templatePath:
						initialSelection && initialSelection.length > 0
							? initialSelection[i]?.templatePath
							: "",
				})),
			);
		}
	}, [data]);

	return isLoading ? (
		<div className="flex h-full max-h-[75vh] items-center justify-center">
			<Loader size="lg" />
		</div>
	) : (
		<form
			onSubmit={form.onSubmit(handleSubmit)}
			className="flex h-full max-h-[75vh] flex-col"
		>
			<Alert mb="md" color="yellow" icon={<IconInfoCircle />}>
				Selecciona solo plantillas con campos iguales
			</Alert>
			<div className="flex-1 overflow-auto">
				<Table withColumnBorders withRowBorders withTableBorder stickyHeader>
					<Table.Thead>
						<Table.Tr>
							{uniqueCombinations &&
								uniqueCombinations.length > 0 &&
								uniqueCombinations[0].map((row, index) => (
									<Table.Th
										className={cn(
											"min-w-40 max-w-40 cursor-pointer bg-gray-100 text-center",
										)}
										key={parseNumberToColumn(index)}
										onClick={() => handleSort(index)}
									>
										{row.column}
										<IconSortAscendingLetters
											className="ml-1 inline-block"
											size={16}
										/>
									</Table.Th>
								))}
							<Table.Th
								className={cn(
									"min-w-40 max-w-40 cursor-pointer bg-gray-100 text-center",
								)}
							>
								Valor a mapear
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</div>

			<div className="flex shrink-0 justify-end gap-2 pt-4">
				<Button type="submit" color="green">
					Guardar
				</Button>
				<Button onClick={() => modals.closeAll()} color="red" variant="outline">
					Cancelar
				</Button>
			</div>
		</form>
	);
}
