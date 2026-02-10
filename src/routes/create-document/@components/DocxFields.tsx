import { ActionIcon, Button, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useAppState } from "@stores/app.store";
import { IconTablePlus } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useCallback, useEffect, useState } from "react";
import { docxFieldsSchema, initialDocxFields } from "./docxFieldSchema";

export default function DocxFields() {
	const [loading, setLoading] = useState(false);
	const templateFilePath = useAppState((state) => state.templateFilePath);

	const form = useForm({
		initialValues: initialDocxFields,
		validate: zod4Resolver(docxFieldsSchema),
	});

	const handleMapToColumn = (index: number) => {
		modals.open({
			title: "Mapear a columna",
			children: <div></div>,
		});
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
		<form className="mt-2 flex flex-col gap-3">
			<Button>Add Field</Button>
			{loading
				? "Cargando campos..."
				: form.getValues().fields.map((item, i) => {
						const mappedColumn = form.getValues().fields[i].mappedToColumn;
						const identifier = form.getValues().fields[i].identifier;
						return (
							<div key={item.identifier} className="flex flex-col gap-1">
								<TextInput
									disabled
									label={`Campo ${identifier}`}
									placeholder="Ingresa el valor o mapea a una columna"
									{...form.getInputProps(`fields.${i}.value`)}
								/>
								<Tooltip
									label={mappedColumn ? `Columna mapeada: ${mappedColumn}` : "Ninguna columna mapeada"}
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
							</div>
						);
					})}
		</form>
	);
}
