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

    const createRoom = async (roomData) => {
        loading.value = true;
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

    const deleteRoom = async (id) => {
        loading.value = true;
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
        createRoom,
        deleteRoom
    };
});

export default useRoomStore;