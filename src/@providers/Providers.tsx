import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { AppStateProvider } from "./AppStateProvider";


interface ProvidersProps {
    children: ReactNode
}
export default function Providers({ children }: ProvidersProps) {
    return (
        <MantineProvider>
            <AppStateProvider>
                {children}
            </AppStateProvider>
        </MantineProvider>
    )
}