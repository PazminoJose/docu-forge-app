import { MantineProvider } from "@mantine/core";
import { ContextMenuProvider } from "mantine-contextmenu";
import type { ReactNode } from "react";

interface ProvidersProps {
	children: ReactNode;
}
export default function Providers({ children }: ProvidersProps) {
	return (
		<MantineProvider>
			<ContextMenuProvider>{children}</ContextMenuProvider>
		</MantineProvider>
	);
}
