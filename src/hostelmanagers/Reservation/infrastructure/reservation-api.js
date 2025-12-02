// src/reservations/infrastructure/api/reservations-api.js

import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";
import {ReservationsAssembler} from "./reservation.assembler.js";

// 🔑 Definimos la ruta base para las reservas
const reservationsEndpointPath = import.meta.env.VITE_RESERVATIONS_ENDPOINT_PATH;
// Nota: Asegúrate de definir VITE_RESERVATIONS_ENDPOINT_PATH en tu archivo .env

export class ReservationsApi extends BaseApi {
    #reservationsEndpoint;

    constructor() {
        super();
        // Inicializa el endpoint base para las operaciones CRUD
        this.#reservationsEndpoint = new BaseEndpoint(this, reservationsEndpointPath, ReservationsAssembler);
    }

    /**
     * Obtiene todas las reservas.
     * @returns {Promise<Reservation[]>} Un array de entidades Reservation.
     */
    getReservations() {
        return this.#reservationsEndpoint.getAll();           // GET /reservations
    }

    /**
     * Obtiene una reserva por su ID.
     * @param {string | number} id - El ID de la reserva.
     * @returns {Promise<Reservation>} La entidad Reservation.
     */
    getReservationById(id) {
        return this.#reservationsEndpoint.getById(id);        // GET /reservations/{id}
    }

    /**
     * Crea una nueva reserva.
     * @param {object} resource - El objeto de datos de la reserva a crear.
     * @returns {Promise<Reservation>} La entidad Reservation creada.
     */
    createReservation(resource) {
        return this.#reservationsEndpoint.create(resource);   // POST /reservations
    }

    /**
     * Actualiza una reserva existente.
     * @param {string | number} id - El ID de la reserva a actualizar.
     * @param {object} resource - El objeto de datos actualizado de la reserva.
     * @returns {Promise<Reservation>} La entidad Reservation actualizada.
     */
    updateReservation(id, resource) {
        return this.#reservationsEndpoint.update(id, resource); // PUT /reservations/{id}
    }

    /**
     * Elimina una reserva por su ID.
     * @param {string | number} id - El ID de la reserva a eliminar.
     * @returns {Promise<object>} Objeto de confirmación de la eliminación.
     */
    deleteReservation(id) {
        return this.#reservationsEndpoint.delete(id);         // DELETE /reservations/{id}
    }

    // 💡 Puedes añadir endpoints específicos si los necesitas, por ejemplo:

    /**
     * Obtiene todas las reservas asociadas a un usuario específico.
     * @param {string | number} userId - El ID del usuario.
     * @returns {Promise<Reservation[]>} Un array de entidades Reservation.
     */
    getReservationsByUserId(userId) {
        // Asume un endpoint que soporta query params: GET /reservations?userId={userId}
        return this.#reservationsEndpoint.getById({ userId });
    }
}