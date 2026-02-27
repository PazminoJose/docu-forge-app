import { Accordion, Checkbox, Divider, Loader } from "@mantine/core";
import MapperFieldInput from "src/routes/generate-docx/@components/MapperFieldInput";
import OpenOutputFolder from "src/routes/generate-docx/@components/OpenOutputFolder";
import { ProcessActionControls } from "src/routes/generate-docx/@components/ProcessActionControls";
import SpreadsheetRangeInput from "src/routes/generate-docx/@components/SpreadsheetRangeInput";
import useProcessDocxSocket from "../../@hooks/useProcessDocxSocket";
import useGenerateSingleDocxActions from "./useGenerateSingleDocxActions";

export default function GenerateSingleDocxOptions() {
	const {
		loading: loadingProcess,
		progress,
		processDocx,
		cancelProcess,
	} = useProcessDocxSocket();

	const {
		form,
		isLoadingFields,
		handleMapToColumn,
		handleRemoveMapping,
		handleCheckUseAsName,
		handleMatchHeaderWithFields,
	} = useGenerateSingleDocxActions();

	return (
		<form
			className="mt-2 flex h-full flex-col justify-between gap-3"
			onSubmit={form.onSubmit(processDocx)}
		>
			<Accordion>
				<div className="flex h-full flex-col gap-2">
					{isLoadingFields ? (
						<Loader size="lg" className="m-auto" />
					) : (
						<>
							<section>
								<Accordion.Item value="fields">
									<Accordion.Control>Campos</Accordion.Control>
									<Accordion.Panel classNames={{ content: "p-0" }}>
										<div className="flex flex-col gap-2">
											{form.getValues().fields.map((field, i) => {
												const mappedColumn =
													form.getValues().fields[i].mappedToColumn;
												const range = form.getValues().range;
												const identifier =
													form.getValues().fields[i].identifier;
												return (
													<MapperFieldInput
														key={field.identifier}
														{...form.getInputProps(`fields.${i}.value`)}
														error={
															form.getInputProps(`fields.${i}.mappedToColumn`)
																.error
														}
														label={`Campo ${identifier}`}
														disabled={Boolean(mappedColumn)}
														showRemoveMapping={Boolean(mappedColumn)}
														checkboxProps={{
															...form.getInputProps(`fields.${i}.useAsName`, {
																type: "checkbox",
															}),
															onChange: (event) =>
																handleCheckUseAsName(
																	i,
																	event.currentTarget.checked,
																),
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
												);
											})}
										</div>
									</Accordion.Panel>
								</Accordion.Item>
							</section>
							<section className="flex flex-col gap-2">
								<Divider my="sm" label="Opciones" labelPosition="center" />
								<Checkbox
									label="Hacer match columnas (cabecera) con campos"
									onChange={(event) =>
										handleMatchHeaderWithFields(event.currentTarget.checked)
									}
								/>
								<Checkbox
									label="Saltar primera fila (cabecera)"
									{...form.getInputProps("skipHeader", { type: "checkbox" })}
								/>
								<Checkbox
									label="Generar para todas las hojas de excel (usar solo si todas las hojas tienen la misma estructura)"
									{...form.getInputProps("applyToAllSheets", {
										type: "checkbox",
									})}
								/>
								<Checkbox
									label="Unir archivos generados en uno solo"
									{...form.getInputProps("mergeGeneratedFiles", {
										type: "checkbox",
									})}
								/>
							</section>
							<section>
								<Divider
									my="sm"
									label="Rango a generar"
									labelPosition="center"
								/>
								<SpreadsheetRangeInput
									disable={form.getValues().applyToAllSheets}
									fromProps={{ ...form.getInputProps("range.from") }}
									toProps={{ ...form.getInputProps("range.to") }}
								/>
							</section>
							<section className="flex flex-col gap-2">
								<Divider my="sm" label="Acciones" labelPosition="center" />
								<OpenOutputFolder />
							</section>
						</>
					)}
				</div>
			</Accordion>
			<ProcessActionControls
				loading={loadingProcess}
				progress={progress}
				onCancel={cancelProcess}
			/>
		</form>
	);
}
