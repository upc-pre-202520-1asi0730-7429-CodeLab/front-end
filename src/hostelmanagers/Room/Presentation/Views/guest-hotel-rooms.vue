<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import useRoomStore from "../../application/room.store.js";
import useReservationStore from "../../../Reservation/application/reservation.store.js";
import { useAuthStore } from "../../../IAM/application/auth.store.js";
import useHotelStore from "../../../Hotel/application/hotel.store.js";

const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();
const reservationStore = useReservationStore();
const authStore = useAuthStore();
const hotelStore = useHotelStore();

const hotelId = ref(parseInt(route.params.hotelId));
const hotel = computed(() => hotelStore.currentHotel);
const rooms = computed(() => roomStore.rooms.filter(r => r.isAvailable));
const user = computed(() => authStore.user);

const showReservationDialog = ref(false);
const selectedRoom = ref(null);
const reservationForm = ref({
  checkInDate: null,
  checkOutDate: null,
  guestName: "",
  guestEmail: ""
});

onMounted(async () => {
  await hotelStore.fetchHotelById(hotelId.value);
  await roomStore.fetchRoomsByHotelId(hotelId.value);
});

const openReservationDialog = (room) => {
  selectedRoom.value = room;
  reservationForm.value = {
    checkInDate: null,
    checkOutDate: null,
    guestName: user.value?.names || "",
    guestEmail: user.value?.username || ""
  };
  showReservationDialog.value = true;
};

const calculateTotalPrice = computed(() => {
  if (!reservationForm.value.checkInDate || !reservationForm.value.checkOutDate || !selectedRoom.value) {
    return 0;
  }
  const checkIn = new Date(reservationForm.value.checkInDate);
  const checkOut = new Date(reservationForm.value.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights * selectedRoom.value.price : 0;
});

const calculateNights = computed(() => {
  if (!reservationForm.value.checkInDate || !reservationForm.value.checkOutDate) {
    return 0;
  }
  const checkIn = new Date(reservationForm.value.checkInDate);
  const checkOut = new Date(reservationForm.value.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
});

const makeReservation = async () => {
  if (!reservationForm.value.checkInDate || !reservationForm.value.checkOutDate) {
    alert("Please select check-in and check-out dates");
    return;
  }

  const success = await reservationStore.createReservation({
    roomId: selectedRoom.value.id,
    userId: user.value.id,
    hotelId: hotelId.value,
    checkInDate: reservationForm.value.checkInDate.toISOString().split('T')[0],
    checkOutDate: reservationForm.value.checkOutDate.toISOString().split('T')[0],
    status: "pending",
    totalPrice: calculateTotalPrice.value,
    guestName: reservationForm.value.guestName,
    guestEmail: reservationForm.value.guestEmail
  });

  if (success) {
    alert("Reservation created successfully!");
    showReservationDialog.value = false;
    router.push({ name: "guest-reservations" });
  }
};

const goBack = () => {
  router.push({ name: "guest-hotels" });
};
</script>
<template>
  <div class="rooms-container">
    <div class="page-header">
      <div class="flex items-center gap-4">
        <pv-button
            icon="pi pi-arrow-left"
            rounded
            text
            @click="goBack"
        />
        <div>
          <h1 class="text-4xl font-bold text-gray-800">{{ hotel?.name }}</h1>
          <p class="text-gray-600 mt-1">Available Rooms</p>
        </div>
      </div>
    </div>

    <div v-if="rooms.length === 0" class="empty-state">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-xl text-gray-500">No rooms available at the moment</p>
      <pv-button
          label="Browse Other Hotels"
          icon="pi pi-arrow-left"
          outlined
          @click="goBack"
          class="mt-4"
      />
    </div>

    <div v-else class="rooms-grid">
      <pv-card
          v-for="room in rooms"
          :key="room.id"
          class="room-card"
      >
        <template #header>
          <div class="room-image-container">
            <img
                :src="room.image || 'https://via.placeholder.com/400x280'"
                :alt="room.type"
                class="room-image"
            />
            <div class="room-badge">
              <pv-tag value="Available" severity="success" />
            </div>
          </div>
        </template>

        <template #title>
          <h3 class="room-type">{{ room.type }} Room</h3>
        </template>

        <template #content>
          <div class="room-price">
            <span class="price-amount">${{ room.price.toFixed(2) }}</span>
            <span class="price-label">/ night</span>
          </div>
        </template>

        <template #footer>
          <pv-button
              label="Reserve Now"
              icon="pi pi-calendar-plus"
              class="w-full reserve-button"
              @click="openReservationDialog(room)"
          />
        </template>
      </pv-card>
    </div>

    <!-- Reservation Dialog - CONTINUES... -->
    <!-- Reservation Dialog -->
    <pv-dialog
        v-model:visible="showReservationDialog"
        header="Make a Reservation"
        :style="{ width: '600px' }"
        modal
    >
      <div class="dialog-content">
        <div class="selected-room-info">
          <img
              :src="selectedRoom?.image || 'https://via.placeholder.com/150'"
              alt="Room"
              class="dialog-room-image"
          />
          <div>
            <h4 class="text-lg font-semibold">{{ selectedRoom?.type }} Room</h4>
            <p class="text-2xl font-bold text-green-600">${{ selectedRoom?.price.toFixed(2) }}/night</p>
          </div>
        </div>

        <div class="form-section">
          <pv-float-label variant="on" class="mb-4">
            <pv-input-text id="guestName" v-model="reservationForm.guestName" class="w-full" required />
            <label for="guestName">Guest Name</label>
          </pv-float-label>

          <pv-float-label variant="on" class="mb-4">
            <pv-input-text id="guestEmail" v-model="reservationForm.guestEmail" type="email" class="w-full" required />
            <label for="guestEmail">Email</label>
          </pv-float-label>

          <div class="date-inputs">
            <div class="date-field">
              <label class="block mb-2 font-medium text-gray-700">Check-in Date</label>
              <pv-calendar
                  v-model="reservationForm.checkInDate"
                  :min-date="new Date()"
                  date-format="yy-mm-dd"
                  show-icon
                  class="w-full"
              />
            </div>

            <div class="date-field">
              <label class="block mb-2 font-medium text-gray-700">Check-out Date</label>
              <pv-calendar
                  v-model="reservationForm.checkOutDate"
                  :min-date="reservationForm.checkInDate || new Date()"
                  date-format="yy-mm-dd"
                  show-icon
                  class="w-full"
              />
            </div>
          </div>

          <div v-if="calculateTotalPrice > 0" class="reservation-summary">
            <div class="summary-row">
              <span>Number of Nights:</span>
              <span class="font-semibold">{{ calculateNights }}</span>
            </div>
            <div class="summary-row">
              <span>Price per Night:</span>
              <span class="font-semibold">${{ selectedRoom?.price.toFixed(2) }}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total Amount:</span>
              <span class="font-bold text-2xl text-green-600">${{ calculateTotalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <pv-button
            label="Cancel"
            severity="secondary"
            outlined
            @click="showReservationDialog = false"
        />
        <pv-button
            label="Confirm Reservation"
            icon="pi pi-check"
            @click="makeReservation"
            :disabled="!reservationForm.checkInDate || !reservationForm.checkOutDate"
        />
      </template>
    </pv-dialog>
  </div>
</template>
<style scoped>
.rooms-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 6rem 2rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.room-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}

.room-image-container {
  position: relative;
  overflow: hidden;
}

.room-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.3s;
}

.room-card:hover .room-image {
  transform: scale(1.05);
}

.room-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.room-type {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  text-transform: capitalize;
}

.room-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #10b981;
}

.price-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.reserve-button {
  font-size: 1.1rem;
  padding: 0.75rem;
}

.dialog-content {
  padding: 1rem 0;
}

.selected-room-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.dialog-room-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.date-field {
  display: flex;
  flex-direction: column;
}

.reservation-summary {
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.total-row {
  border-top: 2px solid #86efac;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .date-inputs {
    grid-template-columns: 1fr;
  }
}
</style>