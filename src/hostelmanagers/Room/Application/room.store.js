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

    const createRoom = async (roomData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.createRoom(roomData);
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
            const roomToDelete = rooms.value.find(r => r.id === id);
            await api.deleteRoom(id);
            await fetchRoomsByHotelId(roomToDelete.hotelId);
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