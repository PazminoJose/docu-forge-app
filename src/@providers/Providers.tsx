import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ContextMenuProvider } from "mantine-contextmenu";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
	children: ReactNode;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: Infinity,
		},
	},
});

export default function Providers({ children }: ProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			<MantineProvider>
				<Toaster richColors />
				<ContextMenuProvider>
					<ModalsProvider>{children}</ModalsProvider>
				</ContextMenuProvider>
			</MantineProvider>
		</QueryClientProvider>
	);
}
