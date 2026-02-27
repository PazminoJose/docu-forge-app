import { create } from "zustand";

interface AppState {
	dataFilePath: string;
	setDataFilePath: (path: string) => void;
	templateFilePath: string;
	setTemplateFilePath: (path: string) => void;
	outputFolderPath: string;
	setOutputFolderPath: (path: string) => void;
	multipleTemplatesMode: boolean;
	setMultipleTemplatesMode: (value: boolean) => void;
}

const initialState: AppState = {
	dataFilePath: "",
	setDataFilePath: () => {},
	templateFilePath: "",
	setTemplateFilePath: () => {},
	outputFolderPath: "",
	setOutputFolderPath: () => {},
	multipleTemplatesMode: false,
	setMultipleTemplatesMode: () => {},
};

export const useAppState = create<AppState>((set) => ({
	...initialState,
	setDataFilePath: (file) => set({ dataFilePath: file }),
	setTemplateFilePath: (file) => set({ templateFilePath: file }),
	setOutputFolderPath: (path) => set({ outputFolderPath: path }),
	setMultipleTemplatesMode: (value) => set({ multipleTemplatesMode: value }),
}));
