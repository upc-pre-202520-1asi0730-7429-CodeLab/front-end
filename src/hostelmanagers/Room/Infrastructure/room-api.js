// rooms/infrastructure/room-api.js
import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

const roomsEndpointPath = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;

export class RoomsApi extends BaseApi {
    #roomsEndpoint;

    constructor() {
        super();
        this.#roomsEndpoint = new BaseEndpoint(this, roomsEndpointPath);
    }

    getRooms() {
        return this.#roomsEndpoint.getAll();
    }

    getRoomById(id) {
        return this.#roomsEndpoint.getById(id);
    }

    getRoomsByHotelId(hotelId) {
        return this.http.get(`${roomsEndpointPath}?hotelId=${hotelId}`);
    }

    createRoom(resource) {
        return this.#roomsEndpoint.create(resource);
    }

    updateRoom(id, resource) {
        return this.#roomsEndpoint.update(id, resource);
    }

    deleteRoom(id) {
        return this.#roomsEndpoint.delete(id);
    }
}