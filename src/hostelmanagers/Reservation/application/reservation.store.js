// Archivo: src/reservations/application/reservation.store.js

import { defineStore } from "pinia";
import { ref } from "vue";
import {ReservationsApi} from "../infrastructure/reservation-api.js";
import {ReservationsAssembler} from "../infrastructure/reservation.assembler.js";

// Inicialización de la API
const api = new ReservationsApi();

/**
 * Define el store de Pinia para manejar el estado de las Reservas.
 */
export const useReservationStore = defineStore("reservations", () => {
    // --- Estado Reactivo ---
    const reservations = ref([]);
    const currentReservation = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    // --- Funciones de Carga (FETCH) ---

    /**
     * Obtiene todas las reservas (uso general).
     */
    const fetchReservations = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getReservations();
            reservations.value = ReservationsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Obtiene una reserva específica por su ID.
     * @param {string | number} id - El ID de la reserva.
     */
    const fetchReservationById = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getReservationById(id);
            currentReservation.value = ReservationsAssembler.toEntityFromResource(response.data);
        } catch (err) {
            console.error(`Error fetching reservation ${id}:`, err);
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Obtiene reservas filtradas por UserID o RoomID (usando el endpoint de consulta).
     * @param {object} params - { userId: string | number } o { roomId: string | number }.
     */
    const fetchReservationsByFilter = async (params) => {
        loading.value = true;
        errors.value = [];
        // Determinar qué filtro usar para el GET /reservations?{key}={value}
        const filterKey = params.userId ? 'userId' : params.roomId ? 'roomId' : null;
        const filterValue = params.userId || params.roomId;

        if (!filterKey) {
            errors.value.push(new Error("Debe proporcionar userId o roomId para filtrar."));
            loading.value = false;
            return;
        }

        try {
            // Asume que ReservationsApi tiene un método getByQuery o lo implementa internamente en getReservations
            // Usamos la implementación de getReservations que podría manejar filtros si la API lo permite,
            // o si has implementado getReservationsByUserId/RoomId en tu API.

            // Usaremos el método específico que definimos en ReservationsApi:
            const response = await api.getReservationsByUserId(filterValue); // Si solo tienes por UserID
            // const response = await api.getReservationsByRoomId(filterValue); // Si tienes por RoomID

            // Dado que definimos getReservationsByUserId en el API anterior:
            if (filterKey === 'userId') {
                const userResponse = await api.getReservationsByUserId(filterValue);
                reservations.value = ReservationsAssembler.toEntitiesFromResponse(userResponse);
            } else if (filterKey === 'roomId') {
                // **NOTA:** Asumo que existe un método similar en la API para RoomId si lo necesitas.
                // Si solo tienes un endpoint de consulta general, se usaría:
                // const roomResponse = await api.getByQuery({ roomId: filterValue });
                // Por simplicidad, si no existe el método, solo filtramos localmente después de un fetch,
                // pero es mejor usar un endpoint de API para esto:
                // rooms.value = await api.getReservationsByRoomId(filterValue);
                await fetchReservations(); // Volvemos al fetch general si el método específico no existe
                reservations.value = reservations.value.filter(r => String(r.roomId) === String(filterValue));
            }

        } catch (err) {
            console.error(`Error fetching reservations by filter ${filterKey}:`, err);
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };


    // --- Funciones de Modificación (CRUD) ---

    /**
     * Crea una nueva reserva.
     * @param {object} resource - Los datos de la reserva (checkInDate, checkOutDate, etc.).
     * @returns {boolean} True si fue exitoso.
     */
    const createReservation = async (resource) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.createReservation(resource);
            // Opcional: Recargar la lista después de la creación, o añadir la entidad devuelta
            // Si la API devuelve la entidad creada:
            const newReservation = ReservationsAssembler.toEntityFromResource(response.data);
            reservations.value.push(newReservation);
            return true;
        } catch (err) {
            console.error('Error creating reservation:', err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Elimina una reserva por su ID.
     * @param {string | number} id - El ID de la reserva a eliminar.
     * @returns {boolean} True si fue exitoso.
     */
    const deleteReservation = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.deleteReservation(id);
            // Eliminar de la lista localmente
            reservations.value = reservations.value.filter(r => String(r.id) !== String(id));
            return true;
        } catch (err) {
            console.error(`Error deleting reservation ${id}:`, err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };


    return {
        reservations,
        currentReservation,
        loading,
        errors,
        fetchReservations,
        fetchReservationById,
        fetchReservationsByFilter, // Función de filtro general
        createReservation,
        deleteReservation,
    };
});