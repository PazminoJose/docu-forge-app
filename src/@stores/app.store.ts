import { create } from "zustand";

interface AppState {
	dataFile: File | null;
	setDataFile: (path: File | null) => void;
	documentTemplate: File | null;
	setDocumentTemplate: (path: File | null) => void;
	outputFolderPath: string | null;
	setOutputFolderPath: (path: string | null) => void;
}

const initialState: AppState = {
	dataFile: null,
	setDataFile: () => {},
	documentTemplate: null,
	setDocumentTemplate: () => {},
	outputFolderPath: null,
	setOutputFolderPath: () => {},
};

export const useAppState = create<AppState>((set) => ({
	...initialState,
	setDataFile: (file) => set({ dataFile: file }),
	setDocumentTemplate: (file) => set({ documentTemplate: file }),
	setOutputFolderPath: (path) => set({ outputFolderPath: path }),
}));
