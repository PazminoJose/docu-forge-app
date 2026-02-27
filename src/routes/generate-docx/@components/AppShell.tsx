import { ActionIcon, AppShell as MantineAppShell } from "@mantine/core";
import { IconArrowBigLeftFilled } from "@tabler/icons-react";
import { Outlet, useRouter } from "@tanstack/react-router";
import DocxViewer from "./DocxViewer";

export function AppShell() {
	const router = useRouter();

	const handleGoBack = () => {
		router.navigate({
			to: "/",
		});
	};

	return (
		<MantineAppShell navbar={{ width: 450, breakpoint: "xs" }} padding="md">
			<MantineAppShell.Navbar p="md" className="overflow-auto">
				<ActionIcon
					onClick={handleGoBack}
					size="lg"
					className="rounded-full bg-primary-500"
				>
					<IconArrowBigLeftFilled />
				</ActionIcon>
				<Outlet />
			</MantineAppShell.Navbar>
			<MantineAppShell.Main>
				<div className="h-full w-full">
					<DocxViewer />
				</div>
			</MantineAppShell.Main>
		</MantineAppShell>
	);
}
