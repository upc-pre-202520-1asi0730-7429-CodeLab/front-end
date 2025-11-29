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
            await fetchHotels();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateHotel = async (id, { name, images, address, phone, userId }) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.updateHotel(id, { name, images, address, phone, userId });
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
        fetchHotelById,
        createHotel,
        updateHotel,
        deleteHotel
    };
});

export default useHotelStore;
