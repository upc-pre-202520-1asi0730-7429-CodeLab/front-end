// bookings/application/booking.store.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { BookingsApi } from "../infrastructure/booking-api.js";
import { BookingsAssembler } from "../infrastructure/booking.assembler.js";
import {useAuthStore} from "../../IAM/application/auth.store.js";

const api = new BookingsApi();
const authStore = useAuthStore();

export const useBookingStore = defineStore("bookings", () => {
    const bookings = ref([]);
    const currentBooking = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const fetchBookings = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getBookings();
            bookings.value = BookingsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchBookingsByUserId = async (userId) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getBookingsByUserId(userId);
            bookings.value = BookingsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchBookingsByHotelId = async (hotelId) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getBookingsByHotelId(hotelId);
            bookings.value = BookingsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const fetchBookingById = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getBookingById(id);
            currentBooking.value = BookingsAssembler.toEntityFromResource(response.data);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const createBooking = async (bookingData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.createBooking(bookingData);
            await fetchBookingsByUserId(authStore.user.id);
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const checkIn = async (bookingId) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.checkIn(bookingId);
            await fetchBookings();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const checkOut = async (bookingId) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.checkOut(bookingId);
            await fetchBookings();
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        bookings,
        currentBooking,
        loading,
        errors,
        fetchBookings,
        fetchBookingsByUserId,
        fetchBookingsByHotelId,
        fetchBookingById,
        createBooking,
        checkIn,
        checkOut
    };
});