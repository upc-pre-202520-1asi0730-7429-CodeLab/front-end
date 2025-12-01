<!-- bookings/presentation/MyBookingsView.vue -->
<script setup>
import { onMounted } from "vue";
import {useBookingStore} from "../../Application/booking.store.js";
import {useAuthStore} from "../../../IAM/application/auth.store.js";

const bookingStore = useBookingStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.user) {
    await bookingStore.fetchBookingsByUserId(authStore.user.id);
  }
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusBadge = (status) => {
  const badges = {
    'Pending': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    'Confirmed': { text: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
    'Completed': { text: 'Completada', color: 'bg-green-100 text-green-800' },
    'Cancelled': { text: 'Cancelada', color: 'bg-red-100 text-red-800' }
  };
  return badges[status] || badges['Pending'];
};
</script>

<template>
  <div class="p-4 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Mis Reservas</h1>

    <div v-if="bookingStore.loading" class="flex justify-center py-10">
      <pv-progress-spinner style="width: 50px; height: 50px" strokeWidth="5" />
    </div>

    <div v-else-if="bookingStore.bookings.length === 0" class="text-center py-12 bg-gray-50 rounded-xl">
      <i class="pi pi-calendar-times text-6xl text-gray-400 mb-4 block"></i>
      <p class="text-xl font-medium text-gray-600">No tienes reservas aún</p>
      <pv-button
          label="Ver Hoteles"
          class="mt-4"
          @click="$router.push({ name: 'home' })"
      />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <pv-card
          v-for="booking in bookingStore.bookings"
          :key="booking.id"
          class="shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <template #title>
          <div class="flex justify-between items-start">
            <div>
              <h2 class="font-bold text-lg">{{ booking.room?.type }}</h2>
              <p class="text-sm text-gray-500 mt-1">Habitación #{{ booking.roomId }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusBadge(booking.status).color]">
              {{ getStatusBadge(booking.status).text }}
            </span>
          </div>
        </template>

        <template #content>
          <div class="space-y-3">
            <div v-if="booking.room?.image" class="w-full h-40 overflow-hidden rounded-lg">
              <img :src="booking.room.image" alt="Habitación" class="w-full h-full object-cover" />
            </div>

            <div class="flex justify-between text-sm">
              <div>
                <p class="font-medium">Check-in</p>
                <p class="text-gray-600">{{ formatDate(booking.checkInDate) }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium">Check-out</p>
                <p class="text-gray-600">{{ formatDate(booking.checkOutDate) }}</p>
              </div>
            </div>

            <div class="pt-2 border-t">
              <p class="font-medium">Total a pagar</p>
              <p class="text-xl font-bold text-green-600">
                ${{ (booking.room?.price * getNights(booking)).toLocaleString() }}
              </p>
              <p class="text-sm text-gray-500">({{ getNights(booking) }} noches × ${{ booking.room?.price.toLocaleString() }})</p>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-between">
            <pv-button
                label="Detalles"
                severity="secondary"
                outlined
                @click="$router.push({ name: 'booking-details', params: { id: booking.id } })"
            />
            <pv-button
                v-if="booking.status === 'Pending'"
                label="Cancelar"
                severity="danger"
                outlined
                @click="cancelBooking(booking.id)"
            />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    getNights(booking) {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    },
    cancelBooking(id) {
      if (confirm("¿Está seguro de cancelar esta reserva?")) {
        // Implementar cancelación
      }
    }
  }
}
</script>