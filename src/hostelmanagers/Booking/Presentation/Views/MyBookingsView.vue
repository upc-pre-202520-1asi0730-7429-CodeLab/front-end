<script setup>
import { onMounted } from "vue";
import {useBookingStore} from "../../Application/booking.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";

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
    'Pending': { text: 'Pendiente', color: 'pending', icon: 'pi-clock' },
    'Confirmed': { text: 'Confirmada', color: 'confirmed', icon: 'pi-check-circle' },
    'Completed': { text: 'Completada', color: 'completed', icon: 'pi-check' },
    'Cancelled': { text: 'Cancelada', color: 'cancelled', icon: 'pi-times-circle' }
  };
  return badges[status] || badges['Pending'];
};

const getNights = (booking) => {
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
};

const cancelBooking = (id) => {
  if (confirm("¿Está seguro de cancelar esta reserva?")) {
    // Implementar cancelación
  }
};
</script>

<template>
  <div class="bookings-container">
    <div class="page-header">
      <div class="header-content">
        <div class="icon-badge">
          <i class="pi pi-calendar"></i>
        </div>
        <div>
          <h1 class="page-title">Mis Reservas</h1>
          <p class="page-subtitle">Gestiona tus reservaciones de hotel</p>
        </div>
      </div>
    </div>

    <div v-if="bookingStore.loading" class="loading-state">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p>Cargando tus reservas...</p>
    </div>

    <div v-else-if="bookingStore.bookings.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="pi pi-calendar-times"></i>
      </div>
      <h3>No tienes reservas aún</h3>
      <p>Explora nuestros hoteles y haz tu primera reserva</p>
      <pv-button
          label="Ver Hoteles"
          icon="pi pi-search"
          class="explore-btn"
          @click="$router.push({ name: 'home' })"
      />
    </div>

    <div v-else class="bookings-grid">
      <div
          v-for="booking in bookingStore.bookings"
          :key="booking.id"
          class="booking-card"
      >
        <div class="card-image">
          <img
              v-if="booking.room?.image"
              :src="booking.room.image"
              alt="Habitación"
          />
          <div v-else class="no-image">
            <i class="pi pi-image"></i>
          </div>
          <div :class="['status-badge', getStatusBadge(booking.status).color]">
            <i :class="['pi', getStatusBadge(booking.status).icon]"></i>
            <span>{{ getStatusBadge(booking.status).text }}</span>
          </div>
        </div>

        <div class="card-content">
          <div class="room-info">
            <h3 class="room-type">{{ booking.room?.type }}</h3>
            <span class="room-id">Habitación #{{ booking.roomId }}</span>
          </div>

          <div class="dates-info">
            <div class="date-item">
              <i class="pi pi-calendar"></i>
              <div>
                <p class="date-label">Check-in</p>
                <p class="date-value">{{ formatDate(booking.checkInDate) }}</p>
              </div>
            </div>

            <div class="date-divider">
              <i class="pi pi-arrow-right"></i>
            </div>

            <div class="date-item">
              <i class="pi pi-calendar"></i>
              <div>
                <p class="date-label">Check-out</p>
                <p class="date-value">{{ formatDate(booking.checkOutDate) }}</p>
              </div>
            </div>
          </div>

          <div class="price-info">
            <div class="price-details">
              <p class="price-label">Total a pagar</p>
              <p class="price-amount">
                ${{ (booking.room?.price * getNights(booking)).toLocaleString() }}
              </p>
              <p class="price-breakdown">
                {{ getNights(booking) }} noches × ${{ booking.room?.price.toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="card-actions">
            <pv-button
                label="Ver Detalles"
                icon="pi pi-info-circle"
                class="details-btn"
                @click="$router.push({ name: 'booking-details', params: { id: booking.id } })"
            />
            <pv-button
                v-if="booking.status === 'Pending'"
                label="Cancelar"
                icon="pi pi-times"
                class="cancel-btn"
                @click="cancelBooking(booking.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.bookings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  padding: 2rem;
}

.page-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease-out;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.icon-badge i {
  font-size: 2rem;
  color: white;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.loading-state,
.empty-state {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out;
}

.loading-spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 2s ease-in-out infinite;
}

.loading-spinner i {
  font-size: 2.5rem;
  color: white;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon i {
  font-size: 4rem;
  color: #f59e0b;
}

.empty-state h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 2rem;
}

.explore-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border: none;
  padding: 0.875rem 2rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.booking-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out;
}

.booking-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.booking-card:hover .card-image img {
  transform: scale(1.1);
}

.no-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image i {
  font-size: 4rem;
  color: #f59e0b;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-badge.pending {
  background: rgba(251, 191, 36, 0.95);
  color: #78350f;
}

.status-badge.confirmed {
  background: rgba(59, 130, 246, 0.95);
  color: #1e3a8a;
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.95);
  color: #065f46;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.95);
  color: #7f1d1d;
}

.card-content {
  padding: 1.5rem;
}

.room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.room-type {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.room-id {
  font-size: 0.75rem;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
}

.dates-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.date-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-item i {
  font-size: 1.5rem;
  color: #f59e0b;
}

.date-label {
  font-size: 0.75rem;
  color: #92400e;
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
}

.date-value {
  font-size: 0.9rem;
  color: #78350f;
  margin: 0;
  font-weight: 700;
}

.date-divider {
  display: flex;
  align-items: center;
  color: #f59e0b;
}

.price-info {
  padding: 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.price-label {
  font-size: 0.875rem;
  color: #065f46;
  margin: 0 0 0.25rem;
  font-weight: 600;
}

.price-amount {
  font-size: 2rem;
  font-weight: 800;
  color: #047857;
  margin: 0 0 0.25rem;
}

.price-breakdown {
  font-size: 0.875rem;
  color: #059669;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.details-btn,
.cancel-btn {
  flex: 1;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.details-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: none;
  color: white;
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

.cancel-btn {
  background: white;
  border: 2px solid #ef4444;
  color: #ef4444;
}

.cancel-btn:hover {
  background: #fef2f2;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .bookings-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .bookings-grid {
    grid-template-columns: 1fr;
  }

  .dates-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .date-divider {
    transform: rotate(90deg);
  }
}
</style>