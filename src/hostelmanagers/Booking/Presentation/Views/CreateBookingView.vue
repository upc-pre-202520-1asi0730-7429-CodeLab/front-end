<!-- bookings/presentation/CreateBookingView.vue -->
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {useAuthStore} from "../../../IAM/application/auth.store.js";
import {useRoomStore} from "../../../Room/Application/room.store.js";
import {useBookingStore} from "../../Application/booking.store.js";

const bookingStore = useBookingStore();
const roomStore = useRoomStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const roomId = ref(route.params.roomId);
const hotelId = ref(route.params.hotelId);

const form = ref({
  checkInDate: "",
  checkOutDate: "",
  roomId: roomId.value,
  userId: authStore.user?.id
});

const room = ref(null);
const error = ref("");
const success = ref("");

onMounted(async () => {
  if (!authStore.user || authStore.user.roles !== 'Client') {
    router.push({ name: 'login' });
    return;
  }

  await roomStore.fetchRoomById(roomId.value);
  room.value = roomStore.currentRoom;

  // Establecer fechas predeterminadas
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  form.value.checkInDate = today.toISOString().split('T')[0];
  form.value.checkOutDate = tomorrow.toISOString().split('T')[0];
});

const handleCreate = async () => {
  error.value = "";
  success.value = "";

  // Validar fechas
  if (new Date(form.value.checkOutDate) <= new Date(form.value.checkInDate)) {
    error.value = "La fecha de check-out debe ser posterior a la de check-in";
    return;
  }

  const ok = await bookingStore.createBooking(form.value);
  if (ok) {
    success.value = "Reserva creada exitosamente";
    setTimeout(() => router.push({ name: 'my-bookings' }), 1500);
  } else {
    error.value = "Error al crear la reserva";
  }
};

const goBack = () => router.push({ name: 'hotel-rooms', params: { hotelId: hotelId.value } });
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto">
    <div class="flex items-center mb-6">
      <pv-button
          icon="pi pi-arrow-left"
          severity="secondary"
          rounded
          @click="goBack"
          class="mr-3"
      />
      <h1 class="text-2xl font-bold text-gray-800">Nueva Reserva</h1>
    </div>

    <pv-card>
      <div v-if="room" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex flex-col md:flex-row gap-4">
          <img :src="room.image" alt="Habitación" class="w-32 h-24 object-cover rounded-lg" />
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-800">{{ room.type }}</h2>
            <p class="text-lg font-bold text-green-600 mt-1">${{ room.price.toLocaleString() }} por noche</p>
            <p class="text-gray-600 mt-1">Hotel ID: {{ hotelId }}</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleCreate" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <pv-float-label variant="on">
            <pv-calendar
                id="checkInDate"
                v-model="form.checkInDate"
                dateFormat="yy-mm-dd"
                required
                class="w-full"
                :minDate="new Date()"
            />
            <label for="checkInDate">Fecha de Check-in</label>
          </pv-float-label>

          <pv-float-label variant="on">
            <pv-calendar
                id="checkOutDate"
                v-model="form.checkOutDate"
                dateFormat="yy-mm-dd"
                required
                class="w-full"
                :minDate="new Date(form.checkInDate || new Date())"
            />
            <label for="checkOutDate">Fecha de Check-out</label>
          </pv-float-label>
        </div>

        <div class="flex justify-end gap-3 mt-4 pt-4 border-t">
          <pv-button type="button" label="Cancelar" severity="secondary" @click="goBack" />
          <pv-button type="submit" label="Reservar Habitación" icon="pi pi-calendar-plus" />
        </div>
      </form>

      <div v-if="success" class="mt-4 text-green-600 font-medium">{{ success }}</div>
      <div v-if="error" class="mt-4 text-red-600 font-medium">{{ error }}</div>
    </pv-card>
  </div>
</template>