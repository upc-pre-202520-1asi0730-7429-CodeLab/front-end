<script setup>
import {ref, onMounted, computed} from 'vue';
import useUserStore from '../../../IAM/application/user.store.js';
import {useToast} from 'primevue/usetoast';
import {useReservationStore} from "../../application/reservation.store.js";

import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tooltip from 'primevue/tooltip';
import InputText from 'primevue/inputtext';
import {HotelsApi} from "../../../Hotel/infrastructure/hotel-api.js";
import {RoomsApi} from "../../../Room/Infrastructure/room-api.js";
import {ReservationsApi} from "../../infrastructure/reservation-api.js";

defineOptions({
  name: 'AdminReservationView'
});

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/doekyziqa/image/upload/";
const DEFAULT_IMAGE_PATH = 'path/to/default/image.jpg';
const vTooltip = Tooltip;

const reservationStore = useReservationStore();
const userStore = useUserStore();
const toast = useToast();
const hotelsApi = new HotelsApi();
const roomsApi = new RoomsApi();
const reservationsApi = new ReservationsApi();

const loading = ref(true);
const adminReservations = ref([]);
const globalFilter = ref('');
const hotelMap = new Map();
const roomMap = new Map();

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

const filteredReservations = computed(() => {
  if (!globalFilter.value) {
    return adminReservations.value;
  }
  const filterText = globalFilter.value.toLowerCase();

  return adminReservations.value.filter(res => {
    return String(res.id).includes(filterText) ||
        res.hotelName.toLowerCase().includes(filterText) ||
        res.roomName.toLowerCase().includes(filterText);
  });
});

const getStatusSeverity = (status) => {
  switch (status) {
    case 'Accepted':
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

const handleAcceptReservation = async (reservationId) => {
  try {
    loading.value = true;
    const NEW_STATUS = "Accepted";

    console.log(`[Action] Intentando actualizar reserva #${reservationId} a estado: ${NEW_STATUS}`);

    await reservationsApi.updateReservation(reservationId, {status: NEW_STATUS});

    const index = adminReservations.value.findIndex(res => String(res.id) === String(reservationId));

    if (index !== -1) {
      adminReservations.value[index].status = NEW_STATUS;
      adminReservations.value.splice(index, 1, {
        ...adminReservations.value[index],
        status: NEW_STATUS
      });
    }

    toast.add({
      severity: 'success',
      summary: 'Reserva Aceptada',
      detail: `La reserva #${reservationId} ha sido marcada como '${NEW_STATUS}'.`,
      life: 3000
    });

  } catch (error) {
    console.error("Error al aceptar la reserva:", error);
    toast.add({
      severity: 'error',
      summary: 'Error de Actualización',
      detail: `No se pudo aceptar la reserva #${reservationId}. Error: ${error.message}`,
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const loadAdminReservations = async () => {
  loading.value = true;
  adminReservations.value = [];
  hotelMap.clear();
  roomMap.clear();

  try {
    const adminId = userStore.currentUser?.id;
    const adminRole = userStore.currentUser?.role;

    console.log(`[AdminCheck] Rol de usuario autenticado: "${adminRole}"`);
    console.log(`[AdminCheck] ID de usuario autenticado: ${adminId}`);

    if (!adminId) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Usuario no autenticado o ID no disponible.',
        life: 5000
      });
      loading.value = false;
      return;
    }

    const hotelsResponse = await hotelsApi.getHotelsByUserId(String(adminId));
    const hotelsFromApi = hotelsResponse.data || [];

    const adminHotels = hotelsFromApi.filter(hotel =>
        String(hotel.userId) === String(adminId)
    );

    console.log(`[Paso 1 - API Raw] Hoteles recibidos de la API (sin filtrar):`, hotelsFromApi);
    console.log(`[Paso 1 - Filtrado] Hoteles *realmente* vinculados a User ID ${adminId}:`, adminHotels);

    adminHotels.forEach(hotel => hotelMap.set(String(hotel.id), hotel));

    const adminHotelIds = adminHotels.map(h => String(h.id));
    if (adminHotelIds.length === 0) {
      console.warn("[Paso 1] Después del filtrado, no hay hoteles asociados a este usuario. Terminando la búsqueda.");
      loading.value = false;
      return;
    }

    let allAdminRooms = [];
    const roomFetchPromises = adminHotelIds.map(async hotelId => {
      const roomsResponse = await roomsApi.getRoomsByHotelId(hotelId);
      return roomsResponse.data || [];
    });

    const roomsResults = await Promise.all(roomFetchPromises);
    allAdminRooms = roomsResults.flat();

    console.log(`[Paso 2] Total de habitaciones encontradas: ${allAdminRooms.length}`);

    allAdminRooms.forEach(room => roomMap.set(String(room.id), room));

    const adminRoomIds = allAdminRooms.map(r => String(r.id));
    if (adminRoomIds.length === 0) {
      console.warn("[Paso 2] No hay habitaciones asociadas a los hoteles. Terminando la búsqueda.");
      loading.value = false;
      return;
    }

    await reservationStore.fetchReservations();
    const allReservations = reservationStore.reservations;

    console.log("[Paso 3] IDs de habitación del Admin (filtrado):", adminRoomIds);
    console.log("[Paso 3] Número total de reservas en el Store:", allReservations.length);

    const relevantReservations = allReservations.filter(res =>
        adminRoomIds.includes(String(res.roomId))
    );

    console.log(`[Paso 3] Reservas relevantes encontradas: ${relevantReservations.length}`, relevantReservations);

    const enrichedPromises = relevantReservations.map(res => {
      const room = roomMap.get(String(res.roomId));
      const hotel = hotelMap.get(String(room?.hotelId));

      const days = calculateDays(res.checkInDate, res.checkOutDate);
      const totalPrice = (room?.price || 0) * days;

      return {
        ...res,
        roomImage: getCloudinaryUrl(room?.imagen),
        roomName: room?.name || 'Habitación Desconocida',
        hotelName: hotel?.name || 'Hotel Desconocido',
        totalPrice: totalPrice,
        daysReserved: days,
      };
    });

    adminReservations.value = await Promise.all(enrichedPromises);

    console.log('=== RESULTADO FINAL: Reservas Vinculadas (User/Admin) ===');
    console.table(adminReservations.value, ['id', 'hotelName', 'roomName', 'status', 'totalPrice']);
    console.log('===========================================================');

  } catch (error) {
    console.error("Error crítico al cargar las reservas:", error);
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: `No se pudieron recuperar las reservas: ${error.message}`,
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log(`[Mount] userStore.currentUser.role es: "${userStore.currentUser?.role}"`);
  loadAdminReservations();
});
</script>

<template>
  <div class="admin-reservations-container">
    <Toast position="top-right"/>

    <div class="page-header">
      <div class="header-content">
        <div class="icon-badge">
          <i class="pi pi-calendar-times"></i>
        </div>
        <div>
          <h1 class="page-title">Gestión de Reservas</h1>
          <p class="page-subtitle">Administra las reservas de tus hoteles</p>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <div class="filter-toolbar">
        <span class="search-wrapper">
          <i class="pi pi-search search-icon"/>
          <InputText
              v-model="globalFilter"
              placeholder="Buscar por ID, Hotel o Habitación..."
              class="search-input"
          />
        </span>
      </div>

      <DataTable
          :value="filteredReservations"
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
            <p>Cargando reservas...</p>
          </div>
        </template>

        <Column header="Habitación" class="col-image">
          <template #body="{ data }">
            <div class="image-wrapper">
              <img
                  v-if="data.roomImage"
                  :src="data.roomImage"
                  :alt="data.roomName"
                  class="room-image"
                  v-tooltip.top="data.roomName"
              />
              <div v-else class="no-image">
                <i class="pi pi-image"></i>
              </div>
            </div>
          </template>
        </Column>

        <Column field="id" header="ID" :sortable="true" class="col-id">
          <template #body="{ data }">
            <span class="reservation-id">#{{ data.id }}</span>
          </template>
        </Column>

        <Column field="hotelName" header="Hotel" :sortable="true" class="col-hotel">
          <template #body="{ data }">
            <div class="hotel-info">
              <i class="pi pi-building"></i>
              <span>{{ data.hotelName }}</span>
            </div>
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
                  v-tooltip.top="`${data.daysReserved} noches`">
              <i :class="['pi', {
                'pi-check-circle': data.status === 'Accepted' || data.status === 'Confirmed',
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
              {{ data.totalPrice.toLocaleString('es-PE', {style: 'currency', currency: 'PEN'}) }}
            </div>
          </template>
        </Column>

        <Column header="Acciones" class="col-actions">
          <template #body="{ data }">
            <Button
                icon="pi pi-check"
                class="accept-btn"
                v-tooltip.top="'Aceptar Reserva'"
                :disabled="data.status !== 'Pending'"
                @click="handleAcceptReservation(data.id)"
            />
          </template>
        </Column>
      </DataTable>

      <div v-if="!loading && adminReservations.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h3>Sin Reservas</h3>
        <p>No se encontraron reservas vinculadas a tus hoteles</p>
      </div>
    </div>

    <div v-if="reservationStore.errors.length" class="error-section">
      <Message severity="error" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        <span>Error grave al obtener la lista de reservas.</span>
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

.admin-reservations-container {
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

.table-wrapper {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.filter-toolbar {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-bottom: 2px solid #fde68a;
}

.search-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #f59e0b;
  font-size: 1.125rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border-radius: 12px;
  border: 2px solid #fde68a;
  background: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
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
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
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
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
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

.col-image {
  width: 100px;
}

.image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-image {
  width: 100%;
  height: 70px;
  object-fit: cover;
  display: block;
}

.no-image {
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  font-size: 1.5rem;
}

.col-id {
  width: 100px;
}

.reservation-id {
  font-weight: 700;
  color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  display: inline-block;
}

.col-hotel {
  min-width: 150px;
}

.hotel-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
}

.hotel-info i {
  color: #f59e0b;
  font-size: 1rem;
}

.col-date {
  width: 130px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}

.date-cell i {
  color: #f59e0b;
}

.col-status {
  width: 130px;
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
  width: 130px;
}

.price-cell {
  font-size: 1.125rem;
  font-weight: 800;
  color: #047857;
}

.col-actions {
  width: 80px;
  text-align: center;
}

.accept-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.accept-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.accept-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 16px;
  margin: 1.5rem;
}

.empty-state i {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #78350f;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #92400e;
  margin: 0;
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
  .admin-reservations-container {
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

  .search-wrapper {
    max-width: 100%;
  }
}
</style>