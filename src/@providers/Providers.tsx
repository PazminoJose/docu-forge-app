import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { ContextMenuProvider } from "mantine-contextmenu";
import type { ReactNode } from "react";

interface ProvidersProps {
	children: ReactNode;
}
export default function Providers({ children }: ProvidersProps) {
	return (
		<MantineProvider>
			<ContextMenuProvider>
				<ModalsProvider>{children}</ModalsProvider>
			</ContextMenuProvider>
		</MantineProvider>
	);
}
