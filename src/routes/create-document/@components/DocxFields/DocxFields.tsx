import {
	ActionIcon,
	Button,
	Checkbox,
	Loader,
	NumberInput,
	Progress,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useShallowEffect } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { IconFileFilled, IconFolderOpen, IconTablePlus, IconX } from "@tabler/icons-react";
import { openPath } from "@tauri-apps/plugin-opener";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { toast } from "sonner";
import useProcessDocxSocket from "../../@hooks/useProcessDocxSocket";
import { useGetDocxFields, useGetSheetRange } from "../../@services/queries";
import SpreadsheetMapper, { type Mapping } from "../SpreadsheetMapper";
import { docxFieldsSchema, initialDocxFields } from "./docxFieldSchema";

export default function DocxFields() {
	const templateFilePath = useAppState((state) => state.templateFilePath);
	const dataFilePath = useAppState((state) => state.dataFilePath);
	const outputFolderPath = useAppState((state) => state.outputFolderPath);
	const { loading: loadingProcess, progress, processDocx, cancelProcess } = useProcessDocxSocket();
	const { data: spreadSheetRange } = useGetSheetRange(dataFilePath);
	const { data: docxFields, isLoading } = useGetDocxFields(templateFilePath);

	const form = useForm({
		initialValues: initialDocxFields,
		validate: zod4Resolver(docxFieldsSchema),
	});

	const handleMapToColumn = async (index: number) => {
		try {
			const initialMappedToColumn = form.getValues().fields[index].mappedToColumn;
			let initialSelection: Mapping | null = null;
			if (initialMappedToColumn) {
				initialSelection = {
					column: initialMappedToColumn,
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
			form.setFieldValue(`fields.${index}.mappedToColumn`, "");
		} else {
			form.setFieldValue(`fields.${index}.mappedToColumn`, column);
		}
	};

	const handleRemoveMapping = (index: number) => {
		const mappedColumn = form.getValues().fields[index].mappedToColumn;
		const useAsName = form.getValues().fields[index].useAsName;
		form.setFieldValue(`fields.${index}.mappedToColumn`, "");
		form.setFieldValue(`fields.${index}.useAsName`, false);
		toast.info("Mapeo removido correctamente", {
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

	const handleOpenOutputFolder = async () => {
		await openPath(outputFolderPath);
	};

	// EFFECTS
	useShallowEffect(() => {
		if (spreadSheetRange) {
			form.setFieldValue("range", spreadSheetRange);
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
				})),
			);
		}
	}, [docxFields]);

	return (
		<form
			className="mt-2 flex h-full flex-col justify-between gap-3"
			onSubmit={form.onSubmit(processDocx)}
		>
			<div className="flex h-full flex-col gap-2">
				{isLoading ? (
					<Loader size="lg" className="m-auto" />
				) : (
					<>
						{form.getValues().fields.map((item, i) => {
							const mappedColumn = form.getValues().fields[i].mappedToColumn;
							const range = form.getValues().range;
							const identifier = form.getValues().fields[i].identifier;
							return (
								<div key={item.identifier} className="flex flex-col gap-1">
									<TextInput
										disabled
										label={`Campo ${identifier}`}
										placeholder="Ingresa el valor o mapea a una columna"
										{...form.getInputProps(`fields.${i}.value`)}
										error={form.getInputProps(`fields.${i}.mappedToColumn`).error}
									/>
									<div className="flex items-center gap-2">
										<Tooltip
											label={
												mappedColumn
													? `Columna mapeada: ${mappedColumn}${range?.from}:${mappedColumn}${range?.to}`
													: "Ninguna columna mapeada"
											}
										>
											<ActionIcon
												onClick={() => handleMapToColumn(i)}
												variant={mappedColumn ? "filled" : "outline"}
												color="green"
												aria-label="Settings"
											>
												<IconTablePlus className="h-[70%] w-[70%]" stroke={1.5} />
											</ActionIcon>
										</Tooltip>
										{mappedColumn && (
											<Tooltip label="Quitar mapeo">
												<ActionIcon
													onClick={() => handleRemoveMapping(i)}
													color="red"
													aria-label="Settings"
												>
													<IconX className="h-[70%] w-[70%]" stroke={1.5} />
												</ActionIcon>
											</Tooltip>
										)}
										<Checkbox
											label="Usar como nombre"
											{...form.getInputProps(`fields.${i}.useAsName`, { type: "checkbox" })}
											onChange={(event) => handleCheckUseAsName(i, event.currentTarget.checked)}
										/>
									</div>
								</div>
							);
						})}
						<div className="flex gap-2">
							<NumberInput
								label="Desde"
								placeholder="Número de fila desde donde tomar los datos"
								{...form.getInputProps("range.from")}
							/>
							<NumberInput
								label="Hasta"
								placeholder="Número de fila hasta donde tomar los datos"
								{...form.getInputProps("range.to")}
							/>
						</div>
						<Checkbox
							label="Saltar primera fila (header)"
							{...form.getInputProps("skipHeader", { type: "checkbox" })}
						/>
						<Button leftSection={<IconFolderOpen />} onClick={handleOpenOutputFolder}>
							Abrir Carpeta
						</Button>
					</>
				)}
			</div>
			<div className="flex flex-col gap-2">
				{loadingProcess && <Progress value={progress} />}
				<Button type="submit" leftSection={<IconFileFilled />} loading={loadingProcess}>
					Generar
				</Button>
				{loadingProcess && (
					<Button color="red" onClick={cancelProcess}>
						Cancelar
					</Button>
				)}
			</div>
		</form>
	);
}
