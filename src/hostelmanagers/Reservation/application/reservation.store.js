// reservations/application/reservation.store.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ReservationsApi } from "../infrastructure/reservation-api.js";
import { ReservationsAssembler } from "../infrastructure/reservation.assembler.js";

const api = new ReservationsApi();

const useReservationStore = defineStore("reservations", () => {
    const reservations = ref([]);
    const currentReservation = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const pendingCheckIns = computed(() =>
        reservations.value.filter(r => r.status === "pending")
    );

    const pendingCheckOuts = computed(() =>
        reservations.value.filter(r => r.status === "checked-in")
    );

    const fetchReservations = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getReservations();
            reservations.value = ReservationsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchReservationsByHotelId = async (hotelId) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getReservationsByHotelId(hotelId);
            reservations.value = ReservationsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchReservationsByUserId = async (userId) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getReservationsByUserId(userId);
            reservations.value = ReservationsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const createReservation = async (reservationData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.createReservation(reservationData);
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateReservation = async (id, reservationData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.updateReservation(id, reservationData);
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const deleteReservation = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.deleteReservation(id);
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const performCheckIn = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.checkIn(id);
            await fetchReservations();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const performCheckOut = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.checkOut(id);
            await fetchReservations();
            return true;
        } catch (err) {
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
        pendingCheckIns,
        pendingCheckOuts,
        fetchReservations,
        fetchReservationsByHotelId,
        fetchReservationsByUserId,
        createReservation,
        updateReservation,
        deleteReservation,
        performCheckIn,
        performCheckOut
    };
});

export default useReservationStore;