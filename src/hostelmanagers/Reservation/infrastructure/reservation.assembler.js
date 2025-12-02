// src/reservations/infrastructure/assembler/reservations-assembler.js


import {Reservation} from "../domain/model/reservation.entity.js";

/**
 * Clase estática responsable de mapear recursos de la API
 * (objetos planos) a entidades de dominio (Reservation).
 */
export class ReservationsAssembler {

    /**
     * Convierte un objeto de recurso (Resource/DTO plano) a una entidad Reservation.
     * * @param {object} resource - El objeto plano recibido del backend.
     * @returns {Reservation} La entidad de dominio Reservation.
     */
    static toEntityFromResource(resource) {
        // Tu constructor de Reservation acepta un objeto plano, así que esta es la forma más limpia.
        return new Reservation({ ...resource });
    }

    /**
     * Convierte la respuesta de la API (que puede ser un array o un objeto contenedor)
     * en un array de entidades Reservation.
     * * @param {object} response - La respuesta completa de la API.
     * @returns {Reservation[]} Un array de entidades Reservation.
     */
    static toEntitiesFromResponse(response) {
        // 1. Determinar cuál es el array de recursos.
        // Asumimos que es 'response.data' o 'response.data.reservations'
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.reservations ?? []; // Fallback a un array vacío si no se encuentra

        // 2. Mapear cada recurso a una entidad
        return resources.map(r => this.toEntityFromResource(r));
    }
}