<script setup>
import {ref, onMounted, computed} from 'vue';
import useUserStore from '../../../IAM/application/user.store.js';
import {useToast} from 'primevue/usetoast';
import {useReservationStore} from "../../application/reservation.store.js";

// Importaciones de Componentes de PrimeVue
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

defineOptions({
  name: 'AdminReservationView'
});

// --- Configuración y Directivas ---
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/doekyziqa/image/upload/";
const DEFAULT_IMAGE_PATH = 'path/to/default/image.jpg';
const vTooltip = Tooltip;

// --- Stores y APIs ---
const reservationStore = useReservationStore();
const userStore = useUserStore();
const toast = useToast();
const hotelsApi = new HotelsApi();
const roomsApi = new RoomsApi();

// --- Estado Reactivo y Mapas de Cache ---
const loading = ref(true);
const adminReservations = ref([]);
const globalFilter = ref('');
const hotelMap = new Map();
const roomMap = new Map();

// --- Utilidades (sin cambios) ---
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

// --- Propiedades Computadas (sin cambios) ---

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

// --- Lógica de Carga y Cruce de Datos (CRÍTICA) ---

const loadAdminReservations = async () => {
  loading.value = true;
  adminReservations.value = [];
  hotelMap.clear();
  roomMap.clear();

  try {
    const adminId = userStore.currentUser?.id;
    const adminRole = userStore.currentUser?.role;

    // 🔑 LOG 1: Verificar el ID y Rol del usuario
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

    // 1. Obtener Hoteles y aplicar DOBLE FILTRO
    const hotelsResponse = await hotelsApi.getHotelsByUserId(String(adminId));
    const hotelsFromApi = hotelsResponse.data || [];

    // 🔑 CORRECCIÓN: Filtramos en el frontend para asegurar que solo usemos hoteles del usuario autenticado
    const adminHotels = hotelsFromApi.filter(hotel =>
        String(hotel.userId) === String(adminId)
    );

    // 🔑 LOG 2: Verificar la respuesta de Hoteles
    console.log(`[Paso 1 - API Raw] Hoteles recibidos de la API (sin filtrar):`, hotelsFromApi);
    console.log(`[Paso 1 - Filtrado] Hoteles *realmente* vinculados a User ID ${adminId}:`, adminHotels);

    adminHotels.forEach(hotel => hotelMap.set(String(hotel.id), hotel));

    const adminHotelIds = adminHotels.map(h => String(h.id));
    if (adminHotelIds.length === 0) {
      console.warn("[Paso 1] Después del filtrado, no hay hoteles asociados a este usuario. Terminando la búsqueda.");
      loading.value = false;
      return;
    }

    // 2. Obtener todas las HABITACIONES de esos Hoteles
    let allAdminRooms = [];
    const roomFetchPromises = adminHotelIds.map(async hotelId => {
      const roomsResponse = await roomsApi.getRoomsByHotelId(hotelId);
      return roomsResponse.data || [];
    });

    const roomsResults = await Promise.all(roomFetchPromises);
    allAdminRooms = roomsResults.flat();

    // 🔑 LOG 3: Verificar las Habitaciones encontradas
    console.log(`[Paso 2] Total de habitaciones encontradas: ${allAdminRooms.length}`);

    allAdminRooms.forEach(room => roomMap.set(String(room.id), room));

    const adminRoomIds = allAdminRooms.map(r => String(r.id));
    if (adminRoomIds.length === 0) {
      console.warn("[Paso 2] No hay habitaciones asociadas a los hoteles. Terminando la búsqueda.");
      loading.value = false;
      return;
    }

    // 3. Obtener TODAS las Reservas y filtrar por los RoomIDs relevantes
    await reservationStore.fetchReservations();
    const allReservations = reservationStore.reservations;

    // 🔑 LOG 4: Verificar los IDs de habitación del Admin y las Reservas totales
    console.log("[Paso 3] IDs de habitación del Admin (filtrado):", adminRoomIds);
    console.log("[Paso 3] Número total de reservas en el Store:", allReservations.length);

    // Filtrar solo las reservas cuyo roomId (convertido a STRING) esté en la lista de habitaciones del admin
    const relevantReservations = allReservations.filter(res =>
        adminRoomIds.includes(String(res.roomId))
    );

    // 🔑 LOG 5: Verificar las Reservas Filtradas
    console.log(`[Paso 3] Reservas relevantes encontradas: ${relevantReservations.length}`, relevantReservations);

    // 4. Enriquecer las Reservas Filtradas
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

// --- Ciclo de Vida ---
onMounted(() => {
  console.log(`[Mount] userStore.currentUser.role es: "${userStore.currentUser?.role}"`);
  loadAdminReservations();
});
</script>

<template>
  <div class="hotels-page-container">

    <Toast position="top-right"/>

    <div class="page-header-section">
      <h1 class="page-title-main">
        <i class="pi pi-calendar-times header-icon"></i>
        Gestión de Reservas
      </h1>
    </div>

    <div class="table-card-wrapper">
      <div class="filter-toolbar">
            <span class="p-input-icon-left">
                <i class="pi pi-search"/>
                <InputText
                    v-model="globalFilter"
                    placeholder="Buscar por ID, Hotel o Habitación"
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
          class="hotels-data-table"
      >
        <template #loading>
          <div class="loading-state">
            <ProgressSpinner class="loading-icon-pv"/>
            Cargando reservas...
          </div>
        </template>

        <Column header="Habitación" class="col-image">
          <template #body="{ data }">
            <div v-if="data.roomImage">
              <img
                  :src="data.roomImage"
                  :alt="data.roomName"
                  class="hotel-image"
                  v-tooltip.top="data.roomName"
              />
            </div>
            <div v-else class="no-image-placeholder">
              <i class="pi pi-image"></i>
            </div>
          </template>
        </Column>

        <Column field="id" header="Res. ID" :sortable="true" class="col-res-id"/>

        <Column field="hotelName" header="Hotel" :sortable="true">
          <template #body="{ data }">
            <span class="name-text">{{ data.hotelName }}</span>
          </template>
        </Column>

        <Column field="checkInDate" header="Llegada" :sortable="true" class="col-date">
          <template #body="{ data }">
            {{ new Date(data.checkInDate).toLocaleDateString() }}
          </template>
        </Column>

        <Column field="checkOutDate" header="Salida" :sortable="true" class="col-date">
          <template #body="{ data }">
            {{ new Date(data.checkOutDate).toLocaleDateString() }}
          </template>
        </Column>

        <Column field="status" header="Estado" :sortable="true" class="col-status">
          <template #body="{ data }">
                    <span :class="['p-tag', 'p-tag-' + getStatusSeverity(data.status)]"
                          v-tooltip.top="`Días: ${data.daysReserved}`"
                    >
                        {{ data.status }}
                    </span>
          </template>
        </Column>

        <Column field="totalPrice" header="Total" :sortable="true" class="col-price">
          <template #body="{ data }">
            <div class="name-text text-lg">
              {{ data.totalPrice.toLocaleString('es-PE', {style: 'currency', currency: 'PEN'}) }}
            </div>
          </template>
        </Column>

        <Column header="Acciones" class="col-actions-small">
          <template #body="{ data }">
            <Button
                icon="pi pi-check"
                class="p-button-sm p-button-success p-button-outlined"
                v-tooltip.top="'Confirmar Reserva'"
                :disabled="data.status !== 'Pending'"
                @click="console.log('Confirmar:', data.id)"
            />
          </template>
        </Column>
      </DataTable>

      <div v-if="!loading && adminReservations.length === 0" class="empty-state">
        <i class="pi pi-search-plus"></i>
        <span>No se encontraron reservas vinculadas a sus hoteles.</span>
      </div>
    </div>

    <div v-if="reservationStore.errors.length" class="error-message-wrapper">
      <Message severity="error">
        <i class="pi pi-exclamation-triangle error-message-icon"></i> Error grave al obtener la lista de reservas.
      </Message>
    </div>

  </div>
</template>

<style scoped>
/* Estilos sin cambios */
.hotels-page-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header-section {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.page-title-main {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 0.75rem;
  color: #dc3545;
  font-size: 1.5rem;
}

.filter-toolbar {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.search-input {
  width: 20rem;
  padding-left: 2.5rem;
}

.table-card-wrapper {
  background-color: #ffffff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  overflow: hidden;
}

.hotels-data-table :deep(.p-datatable-thead > tr > th) {
  background-color: #e9ecef;
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
}

.hotels-data-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: #f1f3f5 !important;
}

.col-image {
  width: 8rem;
}

.hotel-image {
  width: 100%;
  height: 4.5rem;
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-image-placeholder {
  text-align: center;
  color: #adb5bd;
  font-size: 1.25rem;
  padding: 0.5rem 0;
}

.name-text {
  font-weight: 600;
  color: #343a40;
}

.text-lg {
  font-size: 1.125rem;
}

.col-res-id {
  width: 6rem;
  font-weight: 700;
}

.col-date {
  width: 10rem;
}

.col-status {
  width: 8rem;
  text-align: center;
}

.col-price {
  width: 8rem;
  font-weight: 700;
}

.col-actions-small {
  width: 8rem;
  text-align: center;
}

.p-tag {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}

.p-tag-success {
  background-color: #10b981;
}

.p-tag-info {
  background-color: #3b82f6;
}

.p-tag-danger {
  background-color: #ef4444;
}

.p-tag-secondary {
  background-color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #ced4da;
}
</style>