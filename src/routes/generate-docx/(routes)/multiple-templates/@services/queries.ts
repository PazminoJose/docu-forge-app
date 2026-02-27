import { useQuery } from "@tanstack/react-query";
import API from "src/@lib/axios/api";
import type { SpreadsheetColumnFilter } from "../@components/SpreadsheetFilterSelector";

// UNIQUE COMBINATIONS QUERIES
const UNIQUE_COMBINATIONS_QUERY_KEY = "unique-combinations";

async function postUniqueCombinations(
	dataFilePath: string,
	filters: SpreadsheetColumnFilter[],
) {
	const res = await API.post<{
		combinations: { column: string; value: string }[][];
	}>({
		url: `/unique-combinations`,
		data: {
			path: dataFilePath,
			filters,
		},
	});
	return res.combinations;
}

export function useGetUniqueCombinations(
	dataFilePath: string,
	filters: SpreadsheetColumnFilter[],
) {
	return useQuery({
		queryKey: [UNIQUE_COMBINATIONS_QUERY_KEY, dataFilePath, filters],
		queryFn: () => postUniqueCombinations(dataFilePath, filters),
	});
}
