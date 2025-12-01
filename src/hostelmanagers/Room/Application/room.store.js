// rooms/application/room.store.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { RoomsApi } from "../infrastructure/room-api.js";
import { RoomsAssembler } from "../infrastructure/room.assembler.js";

const api = new RoomsApi();

export const useRoomStore = defineStore("rooms", () => {
    const rooms = ref([]);
    const currentRoom = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const fetchRooms = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getRooms();

            // 💡 LOG DE DEBUGGING AQUÍ
            console.log("--- DEBUG: Respuesta Cruda de api.getRooms() (fetchRooms) ---");
            console.log(response);
            console.log("---------------------------------------------------------------");

            rooms.value = RoomsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * 🔄 IMPLEMENTACIÓN CORREGIDA: Obtiene TODAS las habitaciones (GET /api/v1/rooms)
     * y filtra los resultados localmente por el hotelId.
     * @param {number} hotelId - El ID del hotel para filtrar.
     */
    const fetchRoomsByHotelId = async (hotelId) => {
        loading.value = true;
        errors.value = [];
        try {
            // 1. Obtener TODAS las habitaciones usando la función existente
            const response = await api.getRooms();
            const allRooms = RoomsAssembler.toEntitiesFromResponse(response);

            // 2. Filtrar localmente por el hotelId
            rooms.value = allRooms.filter(room =>
                // Aseguramos que se compare con un número entero por si hotelId viene como string
                room.hotelId === parseInt(hotelId)
            );

        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchRoomById = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getRoomById(id);
            currentRoom.value = RoomsAssembler.toEntityFromResource(response.data);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const createRoom = async (roomData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.createRoom(roomData);
            // Recarga usando el nuevo método de filtrado
            await fetchRoomsByHotelId(roomData.hotelId);
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateRoom = async (id, roomData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.updateRoom(id, roomData);
            // Recarga usando el nuevo método de filtrado
            await fetchRoomsByHotelId(roomData.hotelId);
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const deleteRoom = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            // 1. Encontrar el hotelId ANTES de eliminar
            const roomToDelete = rooms.value.find(r => r.id === id);

            // 2. Eliminar la habitación en la API
            await api.deleteRoom(id);

            // 3. Recargar la lista filtrada
            if (roomToDelete) {
                await fetchRoomsByHotelId(roomToDelete.hotelId);
            } else {
                // Si no se encontró localmente, forzamos una recarga completa (o del hotelId actual si se conoce)
                // Dependiendo de cómo manejas el estado de la vista, podrías recargar 'fetchRooms()' o manejar el error.
                throw new Error("Habitación eliminada, pero el ID del hotel original es desconocido.");
            }
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        rooms,
        currentRoom,
        loading,
        errors,
        fetchRooms,
        fetchRoomsByHotelId,
        fetchRoomById,
        createRoom,
        updateRoom,
        deleteRoom
    };
});