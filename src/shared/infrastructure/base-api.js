import axios from "axios";

const platformApi = import.meta.env.VITE_SYSTEM_PLATFORM_API_URL;

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi
        });

        this.#http.interceptors.request.use((config) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    get http() {
        return this.#http;
    }
}
