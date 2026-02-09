import { ActionIcon, AppShell } from "@mantine/core";
import { IconArrowBigLeftFilled } from "@tabler/icons-react";
import { Outlet, useRouter } from "@tanstack/react-router";

export function CreateDocumentAppShell() {
	const router = useRouter();

	const handleGoBack = () => {
		router.navigate({
			to: "/",
		});
	};

	return (
		<AppShell navbar={{ width: 300, breakpoint: "xs" }} padding="md">
			<AppShell.Navbar p="md"></AppShell.Navbar>
			<AppShell.Main>
				<ActionIcon onClick={handleGoBack} className="rounded-full bg-primary-500">
					<IconArrowBigLeftFilled />
				</ActionIcon>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}
