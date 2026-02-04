import { createContext, use, useState } from "react";

interface AppState {
    dataFilePath: string | null;
    setDataFilePath: (path: string | null) => void;
    documentTemplatePath: string | null;
    setDocumentTemplatePath: (path: string | null) => void;
    outputFolderPath: string | null;
    setOutputFolderPath: (path: string | null) => void;
}

const AppStateContext = createContext<AppState>({
    dataFilePath: null,
    setDataFilePath: () => { },
    documentTemplatePath: null,
    setDocumentTemplatePath: () => { },
    outputFolderPath: null,
    setOutputFolderPath: () => { },
});

export function AppStateProvider({ children }: { children: React.ReactNode }) {
    const [dataFilePath, setDataFilePath] = useState<string | null>(null);
    const [documentTemplatePath, setDocumentTemplatePath] = useState<string | null>(null);
    const [outputFolderPath, setOutputFolderPath] = useState<string | null>(null);
    return (
        <AppStateContext
            value={{
                dataFilePath,
                setDataFilePath,
                documentTemplatePath,
                setDocumentTemplatePath,
                outputFolderPath,
                setOutputFolderPath,
            }}
        >
            {children}
        </AppStateContext>
    );
}

export const useAppState = () => {
    return use(AppStateContext)
}