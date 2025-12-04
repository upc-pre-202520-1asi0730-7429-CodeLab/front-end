<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {useRoomStore} from "../../../Room/Application/room.store.js";
import {useBookingStore} from "../../Application/booking.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";

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

const nights = computed(() => {
  if (!form.value.checkInDate || !form.value.checkOutDate) return 0;
  const checkIn = new Date(form.value.checkInDate);
  const checkOut = new Date(form.value.checkOutDate);
  const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

const totalPrice = computed(() => {
  if (!room.value?.price || !nights.value) return 0;
  return room.value.price * nights.value;
});

onMounted(async () => {
  if (!authStore.user || authStore.user.roles !== 'Client') {
    router.push({ name: 'login' });
    return;
  }

  await roomStore.fetchRoomById(roomId.value);
  room.value = roomStore.currentRoom;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  form.value.checkInDate = today.toISOString().split('T')[0];
  form.value.checkOutDate = tomorrow.toISOString().split('T')[0];
});

const handleCreate = async () => {
  error.value = "";
  success.value = "";

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
  <div class="create-booking-container">
    <div class="form-wrapper">
      <div class="back-button-wrapper">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="back-btn"
            @click="goBack"
        />
      </div>

      <div class="form-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <div>
            <h1 class="card-title">Nueva Reserva</h1>
            <p class="card-subtitle">Completa los datos de tu reservación</p>
          </div>
        </div>

        <div v-if="room" class="room-preview">
          <div class="room-image">
            <img
                :src="room.image || 'https://via.placeholder.com/400x250?text=Habitación'"
                :alt="room.type"
            />
          </div>
          <div class="room-details">
            <h2 class="room-type">{{ room.type }}</h2>
            <div class="room-price">
              <span class="currency">$</span>
              <span class="amount">{{ room.price?.toLocaleString() }}</span>
              <span class="period">/ noche</span>
            </div>
            <p class="hotel-info">
              <i class="pi pi-building"></i>
              Hotel ID: {{ hotelId }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleCreate" class="form-content">
          <div v-if="error" class="alert error-alert">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>

          <div v-if="success" class="alert success-alert">
            <i class="pi pi-check-circle"></i>
            <span>{{ success }}</span>
          </div>

          <div class="form-section">
            <label class="section-label">
              <i class="pi pi-calendar"></i>
              Fechas de Estancia
            </label>

            <div class="dates-grid">
              <div class="date-field">
                <label for="checkInDate" class="field-label">Check-in</label>
                <pv-calendar
                    id="checkInDate"
                    v-model="form.checkInDate"
                    dateFormat="yy-mm-dd"
                    required
                    class="input-field"
                    :minDate="new Date()"
                />
              </div>

              <div class="date-field">
                <label for="checkOutDate" class="field-label">Check-out</label>
                <pv-calendar
                    id="checkOutDate"
                    v-model="form.checkOutDate"
                    dateFormat="yy-mm-dd"
                    required
                    class="input-field"
                    :minDate="new Date(form.checkInDate || new Date())"
                />
              </div>
            </div>
          </div>

          <div v-if="nights > 0" class="summary-section">
            <h3 class="summary-title">
              <i class="pi pi-calculator"></i>
              Resumen de Reserva
            </h3>

            <div class="summary-details">
              <div class="summary-row">
                <span>Precio por noche</span>
                <span class="summary-value">${{ room?.price?.toLocaleString() }}</span>
              </div>
              <div class="summary-row">
                <span>Número de noches</span>
                <span class="summary-value">{{ nights }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row">
                <span>Total a pagar</span>
                <span class="total-value">${{ totalPrice.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <pv-button
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                class="btn-cancel"
                @click="goBack"
            />
            <pv-button
                type="submit"
                label="Confirmar Reserva"
                icon="pi pi-check"
                class="btn-submit"
                :loading="bookingStore.loading"
                :disabled="nights <= 0"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.create-booking-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-wrapper {
  width: 100%;
  max-width: 700px;
  animation: fadeInScale 0.5s ease-out;
}

.back-button-wrapper {
  margin-bottom: 1.5rem;
}

.back-btn {
  background: white;
  color: #3b82f6;
  border: 2px solid #bfdbfe;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f0f9ff;
  transform: translateX(-5px);
}

.form-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  padding: 2.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper i {
  font-size: 2rem;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.card-subtitle {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.9;
}

.room-preview {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
  display: flex;
  gap: 2rem;
  animation: slideUp 0.4s ease-out;
}

.room-image {
  width: 200px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.room-type {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
}

.room-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.currency {
  font-size: 1.25rem;
  font-weight: 700;
  color: #047857;
}

.amount {
  font-size: 2rem;
  font-weight: 800;
  color: #047857;
}

.period {
  font-size: 0.875rem;
  color: #64748b;
}

.hotel-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.hotel-info i {
  color: #3b82f6;
}

.form-content {
  padding: 2rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideUp 0.3s ease-out;
}

.error-alert {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.error-alert i {
  color: #dc2626;
  font-size: 1.25rem;
}

.success-alert {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #10b981;
  color: #065f46;
}

.success-alert i {
  color: #059669;
  font-size: 1.25rem;
}

.form-section {
  margin-bottom: 2rem;
  animation: slideUp 0.4s ease-out;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.section-label i {
  color: #3b82f6;
  font-size: 1.125rem;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-field {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.summary-section {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  animation: slideUp 0.5s ease-out;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 1rem;
}

.summary-title i {
  font-size: 1.25rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #047857;
  font-size: 1rem;
}

.summary-value {
  font-weight: 600;
}

.summary-divider {
  height: 1px;
  background: rgba(5, 150, 105, 0.2);
  margin: 0.5rem 0;
}

.total-row {
  font-size: 1.25rem;
  font-weight: 700;
  padding-top: 0.5rem;
}

.total-value {
  font-size: 1.75rem;
  color: #047857;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.btn-submit {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .create-booking-container {
    padding: 1rem;
  }

  .room-preview {
    flex-direction: column;
  }

  .room-image {
    width: 100%;
    height: 200px;
  }

  .dates-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>