import { invoke } from "@tauri-apps/api/core";

export function callPython<T>(
	method: "GET" | "POST" | "PUT" | "DELETE",
	endpoint: string,
	payload: Record<string, unknown> | null = null,
) {
	return invoke<T>("py_api", {
		method,
		endpoint,
		payload,
	});
}
