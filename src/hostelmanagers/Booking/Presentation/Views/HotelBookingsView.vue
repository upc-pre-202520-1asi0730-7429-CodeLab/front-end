<!-- bookings/presentation/HotelBookingsView.vue -->
<script setup>
import { onMounted, ref } from "vue";
import {createRouter as $router, useRoute} from "vue-router";
import {useAuthStore} from "../../../IAM/application/auth.store.js";
import {useBookingStore} from "../../Application/booking.store.js";

const bookingStore = useBookingStore();
const authStore = useAuthStore();
const route = useRoute();
const hotelId = ref(route.params.hotelId);

onMounted(async () => {
  if (authStore.user?.roles !== 'Admin') {
    return;
  }
  await bookingStore.fetchBookingsByHotelId(hotelId.value);
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

const handleCheckIn = async (bookingId) => {
  if (confirm("¿Confirmar check-in para esta reserva?")) {
    await bookingStore.checkIn(bookingId);
  }
};

const handleCheckOut = async (bookingId) => {
  if (confirm("¿Confirmar check-out para esta reserva?")) {
    await bookingStore.checkOut(bookingId);
  }
};
</script>

<template>
  <div class="p-4 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Reservas del Hotel</h1>
      <pv-button
          label="Volver al Hotel"
          icon="pi pi-arrow-left"
          @click="$router.push({ name: 'hotel-rooms', params: { hotelId: hotelId } })"
      />
    </div>

    <pv-data-table
        :value="bookingStore.bookings"
        dataKey="id"
        :loading="bookingStore.loading"
        responsiveLayout="scroll"
        paginator
        :rows="10"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reservas"
        :rowsPerPageOptions="[10,25,50]"
    >
      <pv-column field="user.names" header="Cliente" />

      <pv-column header="Habitación">
        <template #body="slotProps">
          <div>
            <div class="font-medium">{{ slotProps.data.room?.type }}</div>
            <div class="text-sm text-gray-500">ID: #{{ slotProps.data.roomId }}</div>
          </div>
        </template>
      </pv-column>

      <pv-column header="Fechas">
        <template #body="slotProps">
          <div>
            <div class="font-medium">{{ formatDate(slotProps.data.checkInDate) }}</div>
            <div class="text-sm text-gray-500">Check-in</div>
            <div class="font-medium mt-1">{{ formatDate(slotProps.data.checkOutDate) }}</div>
            <div class="text-sm text-gray-500">Check-out</div>
          </div>
        </template>
      </pv-column>

      <pv-column header="Estado">
        <template #body="slotProps">
          <span :class="{
            'bg-yellow-100 text-yellow-800': slotProps.data.status === 'Pending',
            'bg-blue-100 text-blue-800': slotProps.data.status === 'Confirmed',
            'bg-green-100 text-green-800': slotProps.data.status === 'Completed',
            'bg-red-100 text-red-800': slotProps.data.status === 'Cancelled'
          }" class="px-3 py-1 rounded-full text-sm font-medium">
            {{ slotProps.data.status }}
          </span>
        </template>
      </pv-column>

      <pv-column header="Total">
        <template #body="slotProps">
          <div class="font-bold text-green-600">
            ${{ (slotProps.data.room?.price * getNights(slotProps.data)).toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500">
            {{ getNights(slotProps.data) }} noches
          </div>
        </template>
      </pv-column>

      <pv-column header="Acciones">
        <template #body="slotProps">
          <div class="flex flex-wrap gap-2">
            <pv-button
                v-if="slotProps.data.status === 'Pending'"
                label="Check-in"
                severity="success"
                size="small"
                icon="pi pi-sign-in"
                @click="handleCheckIn(slotProps.data.id)"
            />
            <pv-button
                v-if="slotProps.data.status === 'Confirmed'"
                label="Check-out"
                severity="warning"
                size="small"
                icon="pi pi-sign-out"
                @click="handleCheckOut(slotProps.data.id)"
            />
            <pv-button
                label="Ver"
                severity="info"
                size="small"
                icon="pi pi-eye"
                @click="$router.push({ name: 'booking-details', params: { id: slotProps.data.id } })"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>

<script>
export default {
  methods: {
    getNights(booking) {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }
  }
}
</script>