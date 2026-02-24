import axios, { type AxiosResponse } from "axios";
import { toast } from "sonner";
import { envs } from "src/@config/envs";

export const axiosConfig = axios.create({
	baseURL: envs.API_URL,
});

axiosConfig.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error) => {
		let errorMessage: string = "";
		errorMessage =
			error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK"
				? "Error de conexión: Por favor cierre y abra nuevamente la aplicación."
				: error.response?.data.error;
		toast.error(errorMessage);
	},
);

export default axiosConfig;
