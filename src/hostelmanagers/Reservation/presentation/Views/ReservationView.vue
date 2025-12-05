<script setup>
import { ref, onMounted, computed } from 'vue';
import useUserStore from '../../../IAM/application/user.store.js';
import { useToast } from 'primevue/usetoast';
import { useReservationStore } from "../../application/reservation.store.js";
import useHotelStore from "../../../Hotel/application/hotel.store.js";

const hotelStore = useHotelStore();
const roomStore = useRoomStore();
import Card from 'primevue/card';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tooltip from 'primevue/tooltip';
import {RoomsApi} from "../../../Room/Infrastructure/room-api.js";
import {useRoomStore} from "../../../Room/Application/room.store.js";

defineOptions({
  name: 'ReservationView'
});

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/doekyziqa/image/upload/";
const DEFAULT_IMAGE_PATH = 'path/to/default/image.jpg';
const vTooltip = Tooltip;

const reservationStore = useReservationStore();
const userStore = useUserStore();
const toast = useToast();
const roomsApi = new RoomsApi();

const loading = ref(true);
const enrichedReservations = ref([]);

const calculateDays = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffTime = Math.abs(utcEnd - utcStart);
  const diffDays = Math.ceil(diffTime / MS_PER_DAY);

  return diffDays > 0 ? diffDays : 1;
};

const getCloudinaryUrl = (resourcePath) => {
  if (resourcePath && resourcePath.startsWith('http')) {
    return resourcePath;
  }
  return resourcePath ? `${CLOUDINARY_BASE_URL}${resourcePath}` : DEFAULT_IMAGE_PATH;
};

const adminHotels = computed(() =>
    hotelStore.hotels.filter(h => h.userId === userStore.currentUser.id)
);

const adminRooms = computed(() =>
    roomStore.rooms.filter(r =>
        adminHotels.value.some(h => h.id === r.hotelId)
    )
);

const adminRoomIds = computed(() =>
    adminRooms.value.map(r => r.id)
);

const reservations = computed(() => {
  const currentUserId = userStore.currentUser?.id;
  const userRole = userStore.currentUser?.role;
  const currentUserIdString = currentUserId ? String(currentUserId) : null;

  if (!userRole) return [];

  if (userRole === 'Client' && currentUserIdString) {
    return enrichedReservations.value.filter(res => res.userId === currentUserIdString);
  }

  if (userRole === 'Admin') {
    return enrichedReservations.value.filter(res =>
        adminRoomIds.value.includes(res.roomId)
    );
  }

  return enrichedReservations.value;
});

const getStatusSeverity = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Pending':
      return 'info';
    case 'Cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

const loadReservations = async () => {
  loading.value = true;
  enrichedReservations.value = [];

  try {
    await reservationStore.fetchReservations();
    const rawReservations = reservationStore.reservations;

    const roomPromises = rawReservations.map(async (reservation) => {
      const days = calculateDays(reservation.checkInDate, reservation.checkOutDate);
      let roomData = {image: DEFAULT_IMAGE_PATH, price: 0};

      try {
        const response = await roomsApi.getRoomById(reservation.roomId);

        const imagePath = response.data?.imagen;
        roomData.image = getCloudinaryUrl(imagePath);
        roomData.price = response.data?.price || 0;

      } catch (error) {
        console.warn(`No se pudo obtener la habitación ID ${reservation.roomId}:`, error);
      }

      const totalPrice = roomData.price * days;

      return {
        ...reservation,
        roomImage: roomData.image,
        totalPrice: totalPrice,
        daysReserved: days,
        roomId: reservation.roomId
      };
    });

    const finalReservations = await Promise.all(roomPromises);

    console.log('=== Datos de Reservas Enriquecidas para la Tabla ===');
    console.log(finalReservations);
    console.log('==================================================');

    enrichedReservations.value = finalReservations;

  } catch (error) {
    console.error("Error al cargar las reservas:", error);
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: 'No se pudieron recuperar las reservas. Intente de nuevo.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!userStore.currentUser) {
    toast.add({
      severity: 'warn',
      summary: 'Acceso Denegado',
      detail: 'Debe iniciar sesión para ver las reservas.',
      life: 5000
    });
  } else {
    await hotelStore.fetchHotels();
    await roomStore.fetchRooms();
    await loadReservations();
  }
});
</script>

<template>
  <div class="reservations-container">
    <Toast position="top-right"/>

    <div class="page-header">
      <div class="header-content">
        <div class="icon-badge">
          <i class="pi pi-calendar-check"></i>
        </div>
        <div>
          <h1 class="page-title">Mis Reservas</h1>
          <p class="page-subtitle">Gestiona tus reservaciones activas</p>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <DataTable
          :value="reservations"
          dataKey="id"
          :loading="loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 20, 50]"
          class="reservations-table"
      >
        <template #loading>
          <div class="loading-state">
            <div class="loading-spinner">
              <ProgressSpinner class="spinner-icon"/>
            </div>
            <p>Cargando tus reservas...</p>
          </div>
        </template>

        <Column header="Habitación" class="col-image">
          <template #body="{ data }">
            <div class="image-wrapper">
              <img
                  v-if="data.roomImage"
                  :src="data.roomImage"
                  :alt="'Habitación ' + data.roomId"
                  class="room-image"
                  v-tooltip.top="`Habitación ID: ${data.roomId}`"
              />
              <div v-else class="no-image">
                <i class="pi pi-image"></i>
              </div>
            </div>
          </template>
        </Column>

        <Column field="id" header="ID Reserva" :sortable="true" class="col-id">
          <template #body="{ data }">
            <span class="reservation-id">#{{ data.id }}</span>
          </template>
        </Column>

        <Column field="checkInDate" header="Check-in" :sortable="true" class="col-date">
          <template #body="{ data }">
            <div class="date-cell">
              <i class="pi pi-calendar"></i>
              <span>{{ new Date(data.checkInDate).toLocaleDateString('es-ES') }}</span>
            </div>
          </template>
        </Column>

        <Column field="checkOutDate" header="Check-out" :sortable="true" class="col-date">
          <template #body="{ data }">
            <div class="date-cell">
              <i class="pi pi-calendar"></i>
              <span>{{ new Date(data.checkOutDate).toLocaleDateString('es-ES') }}</span>
            </div>
          </template>
        </Column>

        <Column field="status" header="Estado" :sortable="true" class="col-status">
          <template #body="{ data }">
            <span :class="['status-badge', 'status-' + getStatusSeverity(data.status)]"
                  v-tooltip.top="`${data.daysReserved} ${data.daysReserved === 1 ? 'noche' : 'noches'}`">
              <i :class="['pi', {
                'pi-check-circle': data.status === 'Confirmed',
                'pi-clock': data.status === 'Pending',
                'pi-times-circle': data.status === 'Cancelled'
              }]"></i>
              {{ data.status }}
            </span>
          </template>
        </Column>

        <Column field="totalPrice" header="Total" :sortable="true" class="col-price">
          <template #body="{ data }">
            <div class="price-cell">
              <span class="price-amount">
                {{ data.totalPrice.toLocaleString('es-PE', {style: 'currency', currency: 'PEN'}) }}
              </span>
              <span class="price-nights">{{ data.daysReserved }} noche{{ data.daysReserved > 1 ? 's' : '' }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="reservationStore.errors.length" class="error-section">
      <Message severity="error" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        <span>No se pudo obtener la lista de reservas.</span>
      </Message>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.reservations-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
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

.table-wrapper {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.reservations-table :deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.reservations-table :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
}

.reservations-table :deep(.p-datatable-tbody > tr:hover) {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
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
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  width: 3rem;
  height: 3rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-state p {
  color: #64748b;
  font-size: 1.125rem;
  font-weight: 600;
}

.col-image {
  width: 120px;
}

.image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-wrapper:hover {
  transform: scale(1.05);
}

.room-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.no-image {
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 2rem;
}

.col-id {
  width: 120px;
}

.reservation-id {
  font-weight: 700;
  color: #10b981;
  font-size: 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  display: inline-block;
}

.col-date {
  width: 140px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}

.date-cell i {
  color: #10b981;
  font-size: 1rem;
}

.col-status {
  width: 140px;
  text-align: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.status-badge i {
  font-size: 1rem;
}

.status-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.status-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.status-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.status-secondary {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
}

.col-price {
  width: 150px;
}

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #047857;
}

.price-nights {
  font-size: 0.75rem;
  color: #64748b;
}

.error-section {
  margin-top: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-message i {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .reservations-container {
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
}
</style>