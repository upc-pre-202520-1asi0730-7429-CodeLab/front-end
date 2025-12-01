// reservations/infrastructure/reservation-api.js
import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

const reservationsEndpointPath = import.meta.env.VITE_RESERVATIONS_ENDPOINT_PATH;

export class ReservationsApi extends BaseApi {
    #reservationsEndpoint;

    constructor() {
        super();
        this.#reservationsEndpoint = new BaseEndpoint(this, reservationsEndpointPath);
    }

    getReservations() {
        return this.#reservationsEndpoint.getAll();
    }

    getReservationById(id) {
        return this.#reservationsEndpoint.getById(id);
    }

    getReservationsByHotelId(hotelId) {
        return this.http.get(`${reservationsEndpointPath}?hotelId=${hotelId}`);
    }

    getReservationsByUserId(userId) {
        return this.http.get(`${reservationsEndpointPath}?userId=${userId}`);
    }

    createReservation(resource) {
        return this.#reservationsEndpoint.create(resource);
    }

    updateReservation(id, resource) {
        return this.#reservationsEndpoint.update(id, resource);
    }

    deleteReservation(id) {
        return this.#reservationsEndpoint.delete(id);
    }

    // Métodos específicos para check-in/check-out
    checkIn(id) {
        return this.http.patch(`${reservationsEndpointPath}/${id}/check-in`);
    }

    checkOut(id) {
        return this.http.patch(`${reservationsEndpointPath}/${id}/check-out`);
    }
}