<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {useBookingStore} from "../../Application/booking.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";

const bookingStore = useBookingStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
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

const getNights = (booking) => {
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
};
</script>

<template>
  <div class="admin-bookings-container">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-badge">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <div>
            <h1 class="page-title">Reservas del Hotel</h1>
            <p class="page-subtitle">Gestiona las reservaciones de tus clientes</p>
          </div>
        </div>

        <pv-button
            label="Volver al Hotel"
            icon="pi pi-arrow-left"
            class="back-btn"
            @click="router.push({ name: 'hotel-rooms', params: { hotelId: hotelId } })"
        />
      </div>
    </div>

    <div class="table-wrapper">
      <pv-data-table
          :value="bookingStore.bookings"
          dataKey="id"
          :loading="bookingStore.loading"
          responsiveLayout="scroll"
          paginator
          :rows="10"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reservas"
          :rowsPerPageOptions="[10,25,50]"
          class="bookings-table"
      >
        <template #loading>
          <div class="loading-state">
            <div class="loading-spinner">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <p>Cargando reservas...</p>
          </div>
        </template>

        <pv-column field="user.names" header="Cliente" class="col-client">
          <template #body="{ data }">
            <div class="client-info">
              <i class="pi pi-user"></i>
              <span>{{ data.user?.names || 'Cliente' }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column header="Habitación" class="col-room">
          <template #body="{ data }">
            <div class="room-info">
              <div class="room-type">{{ data.room?.type }}</div>
              <div class="room-id">ID: #{{ data.roomId }}</div>
            </div>
          </template>
        </pv-column>

        <pv-column header="Fechas" class="col-dates">
          <template #body="{ data }">
            <div class="dates-column">
              <div class="date-row">
                <i class="pi pi-sign-in"></i>
                <div>
                  <div class="date-value">{{ formatDate(data.checkInDate) }}</div>
                  <div class="date-label">Check-in</div>
                </div>
              </div>
              <div class="date-row">
                <i class="pi pi-sign-out"></i>
                <div>
                  <div class="date-value">{{ formatDate(data.checkOutDate) }}</div>
                  <div class="date-label">Check-out</div>
                </div>
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column header="Estado" class="col-status">
          <template #body="{ data }">
            <span :class="['status-badge', {
              'status-pending': data.status === 'Pending',
              'status-confirmed': data.status === 'Confirmed',
              'status-completed': data.status === 'Completed',
              'status-cancelled': data.status === 'Cancelled'
            }]">
              <i :class="['pi', {
                'pi-clock': data.status === 'Pending',
                'pi-check-circle': data.status === 'Confirmed',
                'pi-check': data.status === 'Completed',
                'pi-times-circle': data.status === 'Cancelled'
              }]"></i>
              {{ data.status }}
            </span>
          </template>
        </pv-column>

        <pv-column header="Total" class="col-total">
          <template #body="{ data }">
            <div class="total-info">
              <div class="total-amount">
                ${{ (data.room?.price * getNights(data)).toLocaleString() }}
              </div>
              <div class="total-nights">
                {{ getNights(data) }} {{ getNights(data) === 1 ? 'noche' : 'noches' }}
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column header="Acciones" class="col-actions">
          <template #body="{ data }">
            <div class="action-buttons">
              <pv-button
                  v-if="data.status === 'Pending'"
                  icon="pi pi-sign-in"
                  v-tooltip.top="'Check-in'"
                  class="action-btn checkin-btn"
                  @click="handleCheckIn(data.id)"
              />
              <pv-button
                  v-if="data.status === 'Confirmed'"
                  icon="pi pi-sign-out"
                  v-tooltip.top="'Check-out'"
                  class="action-btn checkout-btn"
                  @click="handleCheckOut(data.id)"
              />
              <pv-button
                  icon="pi pi-eye"
                  v-tooltip.top="'Ver detalles'"
                  class="action-btn view-btn"
                  @click="router.push({ name: 'booking-details', params: { id: data.id } })"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.admin-bookings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%);
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
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
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

.back-btn {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(100, 116, 139, 0.4);
}

.table-wrapper {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.bookings-table :deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.bookings-table :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
}

.bookings-table :deep(.p-datatable-tbody > tr:hover) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  transform: scale(1.01);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner i {
  font-size: 2.5rem;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.client-info i {
  color: #0ea5e9;
  font-size: 1.125rem;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.room-type {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.room-id {
  font-size: 0.75rem;
  color: #64748b;
}

.dates-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-row i {
  color: #0ea5e9;
  font-size: 1rem;
}

.date-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.date-label {
  font-size: 0.75rem;
  color: #64748b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
}

.status-badge i {
  font-size: 1rem;
}

.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #78350f;
}

.status-confirmed {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.status-completed {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.status-cancelled {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.total-info {
  text-align: right;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #047857;
  margin-bottom: 0.25rem;
}

.total-nights {
  font-size: 0.75rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;
  padding: 0;
}

.checkin-btn {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.checkin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.checkout-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(245, 158, 11, 0.4);
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: white;
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

@media (max-width: 768px) {
  .admin-bookings-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>