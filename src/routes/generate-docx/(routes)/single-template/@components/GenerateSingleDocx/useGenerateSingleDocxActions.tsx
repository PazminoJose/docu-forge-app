import { useForm } from "@mantine/form";
import { useShallowEffect } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { toast } from "sonner";
import SpreadsheetMapper, {
	type Mapping,
} from "src/routes/generate-docx/@components/SpreadsheetMapper";
import {
	useGetDocxFields,
	useGetSheetData,
} from "src/routes/generate-docx/@services/queries";
import {
	generateSingleDocxSchema,
	initialGenerateSingleDocx,
} from "./generateSingleDocxSchema";

export default function useGenerateSingleDocxActions() {
	const templateFilePath = useAppState((state) => state.templateFilePath);
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const { data: sheetData } = useGetSheetData(dataFilePath);
	const { data: docxFields, isLoading: isLoadingFields } =
		useGetDocxFields(templateFilePath);

	const form = useForm({
		initialValues: initialGenerateSingleDocx,
		validate: zod4Resolver(generateSingleDocxSchema),
	});

	// MAP COLUMNS
	const handleMapToColumn = async (index: number) => {
		try {
			const {
				mappedToColumn: initialMappedToColumn,
				mappedToSheet: initialMappedToSheet,
			} = form.getValues().fields[index];

			let initialSelection: Mapping | null = null;
			if (initialMappedToColumn && initialMappedToSheet) {
				initialSelection = {
					column: initialMappedToColumn,
					sheet: initialMappedToSheet,
				};
			}
			modals.open({
				size: "auto",
				title: "Seleccionar la columna",
				children: (
					<SpreadsheetMapper
						initialSelection={initialSelection}
						onSave={(mapping) => handleSaveMapping(index, mapping)}
					/>
				),
			});
		} catch (error) {
			console.log({ error });
		}
	};

	const handleSaveMapping = (index: number, mapping: Mapping) => {
		const { column, sheet } = mapping;
		if (column == null) {
			form.setFieldValue(`fields.${index}.mappedToColumn`, null);
			form.setFieldValue(`fields.${index}.mappedToSheet`, null);
		} else {
			form.setFieldValue(`fields.${index}.mappedToColumn`, column);
			form.setFieldValue(`fields.${index}.mappedToSheet`, sheet);
		}
	};

	const handleRemoveMapping = (index: number) => {
		const mappedColumn = form.getValues().fields[index].mappedToColumn;
		const useAsName = form.getValues().fields[index].useAsName;
		form.setFieldValue(`fields.${index}.mappedToColumn`, null);
		form.setFieldValue(`fields.${index}.useAsName`, false);
		toast.info("Mapeo removido", {
			action: {
				label: "Deshacer",
				onClick: () => {
					form.setFieldValue(`fields.${index}.mappedToColumn`, mappedColumn);
					form.setFieldValue(`fields.${index}.useAsName`, useAsName);
				},
			},
		});
	};

	const handleCheckUseAsName = (index: number, value: boolean) => {
		const fields = form.getValues().fields;
		fields.forEach((_, i) => {
			if (i === index) {
				form.setFieldValue(`fields.${i}.useAsName`, value);
			} else {
				form.setFieldValue(`fields.${i}.useAsName`, false);
			}
		});
	};

	const handleMatchHeaderWithFields = (isSelected: boolean) => {
		if (isSelected) {
			const headerRow = sheetData?.[0].data?.[0];
			const fields = form.getValues().fields;
			if (!headerRow) {
				toast.error(
					"No se encontró una fila de cabecera en la hoja seleccionada",
				);
				return;
			}
			const updatedFields = fields.map((field) => {
				const matchedColumn = headerRow.find(
					(cell) => cell.value.trim() === field.identifier.trim(),
				);
				if (matchedColumn) {
					return {
						...field,
						mappedToColumn: matchedColumn.column,
						mappedToSheet: sheetData[0].sheet,
					};
				}
				return {
					...field,
					mappedToColumn: null,
					mappedToSheet: null,
				};
			});
			form.setFieldValue("fields", updatedFields);
		} else {
			const fields = form.getValues().fields;
			const updatedFields = fields.map((field) => ({
				...field,
				mappedToColumn: null,
				mappedToSheet: null,
			}));
			form.setFieldValue("fields", updatedFields);
		}
	};

	useShallowEffect(() => {
		if (docxFields && docxFields.length > 0) {
			form.setFieldValue(
				"fields",
				docxFields.map((field) => ({
					identifier: field,
					value: `$\{${field}}`,
					useAsName: false,
					mappedToColumn: null,
					mappedToSheet: null,
				})),
			);
		}
	}, [docxFields]);

	return {
		form,
		isLoadingFields,
		handleMapToColumn,
		handleRemoveMapping,
		handleCheckUseAsName,
		handleMatchHeaderWithFields,
	};
}
