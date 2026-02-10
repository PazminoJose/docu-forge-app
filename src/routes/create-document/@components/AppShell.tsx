import { ActionIcon, AppShell as MantineAppShell } from "@mantine/core";
import { IconArrowBigLeftFilled } from "@tabler/icons-react";
import { Outlet, useRouter } from "@tanstack/react-router";
import DocxFields from "./DocxFields";

export function AppShell() {
	const router = useRouter();

	const handleGoBack = () => {
		router.navigate({
			to: "/",
		});
	};

	return (
		<MantineAppShell navbar={{ width: 300, breakpoint: "xs" }} padding="md">
			<MantineAppShell.Navbar p="md">
				<ActionIcon onClick={handleGoBack} size="lg" className="rounded-full bg-primary-500">
					<IconArrowBigLeftFilled />
				</ActionIcon>
				<DocxFields />
			</MantineAppShell.Navbar>
			<MantineAppShell.Main>
				<div className="h-full w-full">
					<Outlet />
				</div>
			</MantineAppShell.Main>
		</MantineAppShell>
	);
}
