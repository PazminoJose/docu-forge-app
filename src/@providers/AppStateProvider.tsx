import { createContext, use, useState } from "react";

interface AppState {
  dataFile: File | null;
  setDataFile: (path: File | null) => void;
  documentTemplate: File | null;
  setDocumentTemplate: (path: File | null) => void;
  outputFolderPath: string | null;
  setOutputFolderPath: (path: string | null) => void;
}

const AppStateContext = createContext<AppState>({
  dataFile: null,
  setDataFile: () => {},
  documentTemplate: null,
  setDocumentTemplate: () => {},
  outputFolderPath: null,
  setOutputFolderPath: () => {},
});

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [documentTemplate, setDocumentTemplate] = useState<File | null>(null);
  const [outputFolderPath, setOutputFolderPath] = useState<string | null>(null);
  return (
    <AppStateContext
      value={{
        dataFile,
        setDataFile,
        documentTemplate,
        setDocumentTemplate,
        outputFolderPath,
        setOutputFolderPath,
      }}
    >
      {children}
    </AppStateContext>
  );
}

export const useAppState = () => {
  return use(AppStateContext);
};
