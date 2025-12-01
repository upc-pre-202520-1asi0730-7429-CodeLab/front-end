// Archivo: src/application/hotel.store.js

import { defineStore } from "pinia";
import { ref } from "vue";
import { HotelsApi } from "../infrastructure/hotel-api.js";
import { HotelsAssembler } from "../infrastructure/hotel.assembler.js";

const api = new HotelsApi();

const useHotelStore = defineStore("hotels", () => {
    const hotels = ref([]);
    const currentHotel = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const fetchHotels = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getHotels();
            hotels.value = HotelsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Obtiene todos los hoteles y filtra localmente aquellos que coinciden
     * con el ID del usuario proporcionado.
     * @param {number} userId - El ID del usuario actual.
     */
    const fetchHotelsByUserId = async (userId) => {
        loading.value = true;
        errors.value = [];
        try {
            // 1. Obtener TODOS los hoteles usando la función existente
            const response = await api.getHotels();
            const allHotels = HotelsAssembler.toEntitiesFromResponse(response);

            // 2. Filtrar localmente: solo mantén los hoteles donde hotel.userId coincida con el userId.
            hotels.value = allHotels.filter(hotel =>
                hotel.userId === userId
            );

        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    // El resto de tus funciones quedan sin cambios:

    const fetchHotelById = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getHotelById(id);
            currentHotel.value = HotelsAssembler.toEntityFromResource(response.data);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const createHotel = async ({ name, images, address, phone, userId }) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.createHotel({ name, images, address, phone, userId });
            // Después de crear, recargar solo los hoteles del usuario actual si es posible,
            // pero mantenemos fetchHotels() para compatibilidad general.
            await fetchHotels();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateHotel = async (id, resource) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.updateHotel(id, resource);
            await fetchHotels();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const deleteHotel = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.deleteHotel(id);
            await fetchHotels();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        hotels,
        currentHotel,
        loading,
        errors,
        fetchHotels,
        fetchHotelsByUserId, // ⬅️ Añadido aquí
        fetchHotelById,
        createHotel,
        updateHotel,
        deleteHotel
    };
});

export default useHotelStore;