// bookings/infrastructure/booking-api.js
import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

const bookingsEndpointPath = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;

export class BookingsApi extends BaseApi {
    #bookingsEndpoint;

    constructor() {
        super();
        this.#bookingsEndpoint = new BaseEndpoint(this, bookingsEndpointPath);
    }

    getBookings() {
        return this.#bookingsEndpoint.getAll();
    }

    getBookingById(id) {
        return this.#bookingsEndpoint.getById(id);
    }

    getBookingsByUserId(userId) {
        return this.http.get(`${bookingsEndpointPath}?userId=${userId}`);
    }

    getBookingsByHotelId(hotelId) {
        return this.http.get(`${bookingsEndpointPath}?hotelId=${hotelId}`);
    }

    createBooking(resource) {
        return this.#bookingsEndpoint.create(resource);
    }

    updateBooking(id, resource) {
        return this.#bookingsEndpoint.update(id, resource);
    }

    deleteBooking(id) {
        return this.#bookingsEndpoint.delete(id);
    }

    checkIn(bookingId) {
        return this.http.patch(`${bookingsEndpointPath}/${bookingId}/check-in`);
    }

    checkOut(bookingId) {
        return this.http.patch(`${bookingsEndpointPath}/${bookingId}/check-out`);
    }
}