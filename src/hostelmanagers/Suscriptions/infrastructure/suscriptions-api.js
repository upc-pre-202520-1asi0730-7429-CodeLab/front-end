import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

const suscriptionsEndpointPath = import.meta.env.VITE_SUSCRIPTIONS_ENDPOINT_PATH || "suscriptions";

export class SuscriptionsApi extends BaseApi {
    #suscriptionsEndpoint;

    constructor() {
        super();
        this.#suscriptionsEndpoint = new BaseEndpoint(this, suscriptionsEndpointPath);
    }

    getSuscriptions() {
        return this.#suscriptionsEndpoint.getAll();
    }

    getSuscriptionById(id) {
        return this.#suscriptionsEndpoint.getById(id);
    }

    createSuscription(resource) {
        return this.#suscriptionsEndpoint.create(resource);
    }
}