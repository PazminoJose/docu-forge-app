import { ActionIcon, Button, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { IconFileFilled, IconTablePlus, IconX } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { callPython } from "@utils/callPython";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useCallback, useEffect, useState } from "react";
import { DocxFieldsSchema, docxFieldsSchema, initialDocxFields } from "./docxFieldSchema";
import SpreadsheetMapper, { type Mapping, type Range } from "./SpreadsheetMapper";

export default function DocxFields() {
	const [loading, setLoading] = useState(false);
	const templateFilePath = useAppState((state) => state.templateFilePath);
	const dataFilePath = useAppState((state) => state.dataFilePath);

	const form = useForm({
		initialValues: initialDocxFields,
		validate: zod4Resolver(docxFieldsSchema),
	});

	const handleMapToColumn = async (index: number) => {
		try {
			const encodedPath = encodeURIComponent(dataFilePath || "");
			const endpoint = `show-data?path=${encodedPath}`;
			const { data, range } = await callPython<{
				data: string[][];
				range: Range;
			}>("GET", endpoint);
			const initialMappedToColumn = form.getValues().fields[index].mappedToColumn;
			const initialRange = form.getValues().fields[index].range;
			let initialSelection: Mapping | null = null;
			if (initialMappedToColumn && initialRange && initialRange.from && initialRange.to) {
				initialSelection = {
					column: initialMappedToColumn,
					range: initialRange as Range,
				};
			}
			modals.open({
				size: "auto",
				title: "Mapear a columna",
				children: (
					<SpreadsheetMapper
						initialSelection={initialSelection}
						data={data}
						range={range}
						onSave={(saved) => {
							const { column, range } = saved;
							if (column == null) {
								form.setFieldValue(`fields.${index}.range`, undefined);
								form.setFieldValue(`fields.${index}.mappedToColumn`, "");
							} else {
								form.setFieldValue(`fields.${index}.mappedToColumn`, column);
								form.setFieldValue(`fields.${index}.range`, range);
								form.setFieldValue(
									`fields.${index}.value`,
									`${column}${range.from}:${column}${range.to}`,
								);
							}
						}}
					/>
				),
			});
		} catch (error) {
			console.log({ error });
		}
	};

	const handleRemoveMapping = (index: number) => {
		form.setFieldValue(`fields.${index}.mappedToColumn`, "");
		form.setFieldValue(`fields.${index}.range`, undefined);
	};

	const handleSubmit = async (values: DocxFieldsSchema) => {
		console.log(values);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const getVariables = useCallback(async () => {
		if (templateFilePath) {
			setLoading(true);
			const res = await invoke<string[]>("get_fields", {
				filePath: templateFilePath,
			});
			if (res && res.length > 0) {
				form.setFieldValue(
					"fields",
					res.map((variable) => ({ identifier: variable, value: `$\{${variable}}` })),
				);
			}
			setLoading(false);
		}
	}, [templateFilePath]);

	useEffect(() => {
		getVariables();
	}, [getVariables]);

	return (
		<form
			className="mt-2 flex h-full flex-col justify-between gap-3"
			onSubmit={form.onSubmit(handleSubmit)}
		>
			<div>
				{loading
					? "Cargando campos..."
					: form.getValues().fields.map((item, i) => {
							const mappedColumn = form.getValues().fields[i].mappedToColumn;
							const range = form.getValues().fields[i].range;
							const identifier = form.getValues().fields[i].identifier;
							return (
								<div key={item.identifier} className="flex flex-col gap-1">
									<TextInput
										disabled
										label={`Campo ${identifier}`}
										placeholder="Ingresa el valor o mapea a una columna"
										{...form.getInputProps(`fields.${i}.value`)}
									/>
									<div className="flex gap-2">
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
									</div>
								</div>
							);
						})}
			</div>
			<Button type="submit" leftSection={<IconFileFilled />}>
				Generar
			</Button>
		</form>
	);
}
