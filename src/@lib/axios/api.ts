import { AxiosRequestConfig } from "axios";
import axios from "./config";

const API = {
	get,
	post,
	put,
	patch,
	del,
	axios,
};

export interface RequestParams {
	url: string;
	params?: object;
	data?: object | string;
	headers?: object;
}

async function get<T>(params: AxiosRequestConfig): Promise<T> {
	const res = await axios<T>({
		...params,
	});
	return res.data;
}

async function post<T>({ method, ...params }: AxiosRequestConfig): Promise<T> {
	const res = await axios<T>({
		method: "POST",
		...params,
	});
	return res.data;
}

async function put<T>(params: RequestParams): Promise<T> {
	const res = await axios<T>({
		url: params.url,
		method: "PUT",
		params: params.params,
		data: params.data,
		headers: params.headers,
	});
	return res.data;
}

async function patch<T>(params: RequestParams): Promise<T> {
	const res = await axios<T>({
		url: params.url,
		method: "PATCH",
		params: params.params,
		data: params.data,
		headers: params.headers,
	});
	return res.data;
}

async function del<T>(params: RequestParams): Promise<T> {
	const res = await axios<T>({
		url: params.url,
		method: "DELETE",
		params: params.params,
		data: params.data,
		headers: params.headers,
	});
	return res.data;
}

export default API;
