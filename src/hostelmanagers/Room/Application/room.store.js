// rooms/application/room.store.js
import { defineStore } from "pinia";
import { ref } from "vue";
import {RoomsApi} from "../Infrastructure/room-api.js";
import {RoomsAssembler} from "../Infrastructure/room.assembler.js";

const api = new RoomsApi();

const useRoomStore = defineStore("rooms", () => {
    const rooms = ref([]);
    const currentRoom = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const fetchRooms = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getRooms();
            rooms.value = RoomsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchRoomsByHotelId = async (hotelId) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getRoomsByHotelId(hotelId);
            rooms.value = RoomsAssembler.toEntitiesFromResponse(response);
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

    const createRoom = async ({ image, type, price, hotelId, isAvailable }) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.createRoom({ image, type, price, hotelId, isAvailable });
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateRoom = async (id, { image, type, price, hotelId, isAvailable }) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.updateRoom(id, { image, type, price, hotelId, isAvailable });
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
            await api.deleteRoom(id);
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

export default useRoomStore;