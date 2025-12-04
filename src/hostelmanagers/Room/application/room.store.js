import { defineStore } from "pinia";
import { ref } from "vue";
import { RoomsApi } from "../infrastructure/room-api.js";
import { RoomsAssembler } from "../infrastructure/room.assembler.js";

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
            const response = await api.getRooms();
            const allRooms = RoomsAssembler.toEntitiesFromResponse(response);

            rooms.value = allRooms.filter(r => r.hotelId === Number(hotelId));
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