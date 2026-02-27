import { useQuery } from "@tanstack/react-query";
import API from "src/@lib/axios/api";

// DOCX FILE QUERIES
const DOCX_FILE_QUERY_KEY = "docx-file";

async function getDocxFile(templateFilePath: string) {
	const encodedPath = encodeURIComponent(templateFilePath || "");
	const res = await API.get<ArrayBuffer>({
		url: `/get-docx-file?path=${encodedPath}`,
		responseType: "arraybuffer",
	});

	return res;
}

export const useGetDocxFile = (templateFilePath: string) => {
	return useQuery({
		queryKey: [DOCX_FILE_QUERY_KEY, templateFilePath],
		queryFn: () => getDocxFile(templateFilePath),
		enabled: Boolean(templateFilePath),
	});
};

// DOCX FIELDS QUERIES
const DOCX_FIELDS_QUERY_KEY = "docx-fields";

async function getDocxFields(templateFilePath: string) {
	const encodedPath = encodeURIComponent(templateFilePath || "");
	const res = await API.get<{ fields: string[] }>({
		url: `/get-docx-fields?path=${encodedPath}`,
	});
	return res.fields;
}

export const useGetDocxFields = (templateFilePath: string) => {
	return useQuery({
		queryKey: [DOCX_FIELDS_QUERY_KEY, templateFilePath],
		queryFn: () => getDocxFields(templateFilePath),
		enabled: Boolean(templateFilePath),
	});
};

// SPREADSHEET RANGE QUERIES
const SPREADSHEET_RANGE_QUERY_KEY = "spreadsheet-range";

export type SpreadsheetRange = {
	sheet: string;
	range: { from: number; to: number };
};

async function getSpreadsheetRange(dataFilePath: string) {
	const encodedPath = encodeURIComponent(dataFilePath || "");
	const res = await API.get<SpreadsheetRange[]>({
		url: `/get-range?path=${encodedPath}`,
	});
	return res;
}

export const useGetSheetRange = (dataFilePath: string) => {
	return useQuery({
		queryKey: [SPREADSHEET_RANGE_QUERY_KEY, dataFilePath],
		queryFn: () => getSpreadsheetRange(dataFilePath),
	});
};

// SPREADSHEET QUERIES
const SPREADSHEET_DATA_QUERY_KEY = "spreadsheet-data";

export type SpreadsheetData = {
	sheet: string;
	data: { column: string; value: string }[][];
};

async function getSpreadsheetData(dataFilePath: string) {
	const encodedPath = encodeURIComponent(dataFilePath || "");
	const res = await API.get<SpreadsheetData[]>({
		url: `/get-data?path=${encodedPath}`,
	});
	return res;
}

export const useGetSheetData = (dataFilePath: string) => {
	return useQuery({
		queryKey: [SPREADSHEET_DATA_QUERY_KEY, dataFilePath],
		queryFn: () => getSpreadsheetData(dataFilePath),
	});
};
