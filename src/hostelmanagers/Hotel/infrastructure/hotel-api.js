import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

const hotelsEndpointPath = import.meta.env.VITE_HOTELS_ENDPOINT_PATH;

export class HotelsApi extends BaseApi {
    #hotelsEndpoint;

    constructor() {
        super();
        this.#hotelsEndpoint = new BaseEndpoint(this, hotelsEndpointPath);
    }

    getHotels() {
        return this.#hotelsEndpoint.getAll();           // GET /hotels
    }

    getHotelById(id) {
        return this.#hotelsEndpoint.getById(id);        // GET /hotels/{id}
    }

    getHotelsByUserId(userId) {
        // Asumiendo que el backend soporta la consulta GET /hotels?userId={userId}
        return this.http.get(`${hotelsEndpointPath}?userId=${userId}`);
    }

    createHotel(resource) {
        return this.#hotelsEndpoint.create(resource);   // POST /hotels
    }

    updateHotel(id, resource) {
        return this.#hotelsEndpoint.update(id, resource); // PUT /hotels/{id}
    }

    deleteHotel(id) {
        return this.#hotelsEndpoint.delete(id);         // DELETE /hotels/{id}
    }
}
