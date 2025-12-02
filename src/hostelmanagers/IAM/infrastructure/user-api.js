import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const signInPath        = import.meta.env.VITE_IAM_ENDPOINT_PATH;
const signUpPath  = "/authentication/sign-up";

export class UsersApi extends BaseApi {
    #usersEndpoint;

    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
    }

    // CRUD de usuarios
    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    getUserById(id) {
        return this.#usersEndpoint.getById(id);
    }

    createUser(resource) {
        return this.#usersEndpoint.create(resource);
    }

    // 👇 Nuevo método para login
    /**
     * Realiza login contra /authentication/sign-in
     * @param {{ username: string, password: string }} credentials
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    signIn(credentials) {
        return this.http.post(signInPath, credentials);
    }
    signUp(payload) {
        return this.http.post(signUpPath, payload);
    }

    getUserRoleById(userId) {
        // La URL completa será: [base-url]/api/v1/users/{userId}/role
        const roleEndpointPath = `${usersEndpointPath}/${userId}/role`;
        // Usamos this.http.get para hacer la solicitud
        return this.http.get(roleEndpointPath);
    }
}
