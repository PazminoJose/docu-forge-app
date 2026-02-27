import {
	ActionIcon,
	Badge,
	Checkbox,
	Divider,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconFilter, IconTableOptions, IconX } from "@tabler/icons-react";
import MapperFieldInput from "src/routes/generate-docx/@components/MapperFieldInput";
import OpenOutputFolder from "src/routes/generate-docx/@components/OpenOutputFolder";
import { ProcessActionControls } from "src/routes/generate-docx/@components/ProcessActionControls";
import SpreadsheetRangeInput from "src/routes/generate-docx/@components/SpreadsheetRangeInput";
import useProcessMultipleDocxSocket from "../../@hooks/useProcesMultipleDocxSocket";
import useGenerateMultipleDocxActions from "./useGenerateMultipleDocxActions";

export default function GenerateMultipleDocxOptions() {
	const {
		loading: loadingProcess,
		progress,
		processDocx,
		cancelProcess,
	} = useProcessMultipleDocxSocket();

	const {
		form,
		handleMapToColumn,
		handleRemoveMapping,
		handleCheckUseAsName,
		handleMapFilters,
		handleAddFilters,
		handleRemoveFilters,
		handleCheckUseAsFolderName,
	} = useGenerateMultipleDocxActions();

	return (
		<form
			onSubmit={form.onSubmit(processDocx)}
			className="mt-2 flex h-full flex-col justify-between gap-3"
		>
			<div>
				<section className="flex flex-col gap-2">
					<Divider my="sm" label="Campos" labelPosition="center" />
					{form.getValues().fields.length === 0 && (
						<Text className="text-center">No hay campos disponibles</Text>
					)}
					{form.getValues().fields.map((field, i) => {
						const mappedColumn = form.getValues().fields[i].mappedToColumn;
						const range = form.getValues().range;
						const identifier = form.getValues().fields[i].identifier;
						return (
							<div key={field.identifier}>
								<MapperFieldInput
									{...form.getInputProps(`fields.${i}.value`)}
									error={form.getInputProps(`fields.${i}.mappedToColumn`).error}
									label={`Campo ${identifier}`}
									disabled={Boolean(mappedColumn)}
									showRemoveMapping={Boolean(mappedColumn)}
									checkboxProps={{
										...form.getInputProps(`fields.${i}.useAsName`, {
											type: "checkbox",
										}),
										onChange: (event) =>
											handleCheckUseAsName(i, event.currentTarget.checked),
									}}
									mapperTooltip={
										mappedColumn
											? `Columna mapeada: ${mappedColumn}${range?.from}:${mappedColumn}${range?.to}`
											: "Mapear a una columna"
									}
									mapperButtonProps={{
										variant: mappedColumn ? "filled" : "outline",
										onClick: () => handleMapToColumn(i),
									}}
									onRemoveMapping={() => handleRemoveMapping(i)}
								/>
							</div>
						);
					})}
				</section>
				<section>
					<Divider my="sm" label="Rango a generar" labelPosition="center" />
					<SpreadsheetRangeInput
						fromProps={form.getInputProps("range.from")}
						toProps={form.getInputProps("range.to")}
					/>
				</section>
				<section className="flex flex-col gap-2">
					<Divider my="sm" label="Acciones" labelPosition="center" />
					<div className="flex gap-2">
						<OpenOutputFolder />
						<ActionIcon onClick={handleAddFilters}>
							<Tooltip label="Agregar filtros">
								<IconFilter className="h-[70%] w-[70%]" stroke={1.5} />
							</Tooltip>
						</ActionIcon>
						{form.getValues().filters.length > 0 && (
							<Tooltip label="Mapear filtros a plantillas">
								<ActionIcon
									color="yellow"
									aria-label="Settings"
									onClick={handleMapFilters}
								>
									<IconTableOptions className="h-[70%] w-[70%]" stroke={1.5} />
								</ActionIcon>
							</Tooltip>
						)}
					</div>
				</section>
				{form.getValues().filters.length > 0 && (
					<section className="flex flex-col gap-2">
						<div className="flex flex-col gap-1">
							<Divider
								my="sm"
								label="Columnas a filtrar"
								labelPosition="center"
							/>
							{form.getValues().filters.map((filter, i) => (
								<div key={filter.column} className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<Badge color="blue">{`${filter.column}:(${filter.label})`}</Badge>
										<ActionIcon
											color="red"
											size="xs"
											onClick={() => handleRemoveFilters(filter)}
										>
											<IconX className="h-[70%] w-[70%]" stroke={1.5} />
										</ActionIcon>
									</div>
									<Checkbox
										label="Crear carpeta"
										{...form.getInputProps(`filters.${i}.useAsFolderName`, {
											type: "checkbox",
										})}
										onChange={(event) =>
											handleCheckUseAsFolderName(i, event.currentTarget.checked)
										}
									/>
								</div>
							))}
						</div>
					</section>
				)}
			</div>
			<ProcessActionControls
				loading={loadingProcess}
				progress={progress}
				onCancel={cancelProcess}
			/>
		</form>
	);
}
