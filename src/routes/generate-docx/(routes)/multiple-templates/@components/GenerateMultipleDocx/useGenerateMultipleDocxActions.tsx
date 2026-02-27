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
	useGetSheetRange,
} from "src/routes/generate-docx/@services/queries";
import SpreadsheetFilters, {
	type SpreadsheetColumnFilter,
} from "../SpreadsheetFilterSelector";
import SpreadsheetFilterTemplateMapper, {
	type TemplateMapping,
} from "../SpreadsheetFilterTemplateMapper";
import {
	generateMultipleDocxSchema,
	initialGenerateMultipleDocx,
} from "./generateMultipleDocxSchema";

export default function useGenerateMultipleDocxActions() {
	const templateFilePath = useAppState((state) => state.templateFilePath);
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const setTemplateFilePath = useAppState((state) => state.setTemplateFilePath);

	const { data: spreadSheetRange } = useGetSheetRange(dataFilePath);
	const { data: docxFields } = useGetDocxFields(templateFilePath);

	const form = useForm({
		initialValues: initialGenerateMultipleDocx,
		validate: zod4Resolver(generateMultipleDocxSchema),
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
		const { column } = mapping;
		if (column == null) {
			form.setFieldValue(`fields.${index}.mappedToColumn`, null);
		} else {
			form.setFieldValue(`fields.${index}.mappedToColumn`, column);
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

	// FILTERS
	const handleAddFilters = () => {
		modals.open({
			centered: true,
			size: "auto",
			title: "Seleccionar las columnas por las que deseas filtrar",
			children: (
				<SpreadsheetFilters
					initialSelection={form.getValues().filters}
					onSave={handleSaveFilters}
				/>
			),
		});
	};

	const handleSaveFilters = (filters: SpreadsheetColumnFilter[]) => {
		form.setFieldValue("filters", filters);
	};

	const handleRemoveFilters = (filter: SpreadsheetColumnFilter) => {
		const updatedFilters = form
			.getValues()
			.filters.filter((f) => f.column !== filter.column);
		form.setFieldValue("filters", updatedFilters);
	};

	const handleCheckUseAsFolderName = (index: number, value: boolean) => {
		const filters = form.getValues().filters;
		filters.forEach((_, i) => {
			if (i === index) {
				form.setFieldValue(`filters.${i}.useAsFolderName`, value);
			} else {
				form.setFieldValue(`filters.${i}.useAsFolderName`, false);
			}
		});
	};

	const handleSelectTemplates = (mapping: TemplateMapping[]) => {
		if (mapping && mapping.length > 0) {
			setTemplateFilePath(mapping[0].templatePath);
			form.setFieldValue("templateMapping", mapping);
		}
	};

	const handleMapFilters = () => {
		modals.open({
			centered: true,
			size: "auto",
			title: "Seleccionar las columnas por las que deseas filtrar",
			children: (
				<SpreadsheetFilterTemplateMapper
					initialSelection={form.getValues().templateMapping}
					filters={form.getValues().filters}
					onSave={handleSelectTemplates}
				/>
			),
		});
	};

	// EFFECTS
	useShallowEffect(() => {
		if (spreadSheetRange && spreadSheetRange.length > 0) {
			form.setFieldValue("range", spreadSheetRange[0].range);
		}
	}, [spreadSheetRange]);

	useShallowEffect(() => {
		if (docxFields && docxFields.length > 0) {
			form.setFieldValue(
				"fields",
				docxFields.map((field) => ({
					identifier: field,
					value: `$\{${field}}`,
					skipHeader: false,
					useAsName: false,
					mappedToColumn: null,
					mappedToSheet: null,
					filterValues: null,
				})),
			);
		}
	}, [docxFields]);

	return {
		form,
		handleMapToColumn,
		handleRemoveMapping,
		handleAddFilters,
		handleMapFilters,
		handleCheckUseAsName,
		handleRemoveFilters,
		handleCheckUseAsFolderName,
	};
}
