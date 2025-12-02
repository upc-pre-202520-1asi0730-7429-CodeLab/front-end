<script setup>
import { ref, onMounted, computed } from 'vue';
import useUserStore from '../../../IAM/application/user.store.js';
import { useToast } from 'primevue/usetoast';
import { useReservationStore } from "../../application/reservation.store.js";

// 🚀 Importaciones de Componentes de PrimeVue (solo necesarias en la plantilla)
import Card from 'primevue/card';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tooltip from 'primevue/tooltip';
import {RoomsApi} from "../../../Room/Infrastructure/room-api.js";

defineOptions({
  name: 'ReservationView'
});

// --- Configuración y Directivas ---
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/doekyziqa/image/upload/";
const DEFAULT_IMAGE_PATH = 'path/to/default/image.jpg';
const vTooltip = Tooltip;

// --- Stores y APIs ---
const reservationStore = useReservationStore();
const userStore = useUserStore();
const toast = useToast();
const roomsApi = new RoomsApi();

// --- Estado Reactivo ---
const loading = ref(true);
const enrichedReservations = ref([]);

// --- Utilidades ---
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


// --- Propiedades Computadas y Lógica de Visualización ---
const reservations = computed(() => {
  const currentUserId = userStore.currentUser?.id;
  const userRole = userStore.currentUser?.role;
  const currentUserIdString = currentUserId ? String(currentUserId) : null;

  if (userRole === 'Client' && currentUserIdString) {
    return enrichedReservations.value.filter(res => res.userId === currentUserIdString);
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

// --- Lógica de Carga y Enriquecimiento de Datos ---
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

        // Usamos 'imagen' según la corrección anterior
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

    // 🔑 LOG DE DEPURACIÓN AGREGADO AQUÍ
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

// --- Ciclo de Vida ---
onMounted(() => {
  if (!userStore.currentUser) {
    toast.add({
      severity: 'warn',
      summary: 'Acceso Denegado',
      detail: 'Debe iniciar sesión para ver las reservas.',
      life: 5000
    });
  } else {
    loadReservations();
  }
});
</script>

<template>
  <div class="hotels-page-container">

    <Toast position="top-right"/>

    <div class="page-header-section">
      <h1 class="page-title-main">
        <i class="pi pi-calendar-check header-icon"></i>
        Mis Reservas
      </h1>
    </div>

    <div class="table-card-wrapper">
      <DataTable
          :value="reservations"
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
            Cargando listado de reservas...
          </div>
        </template>

        <Column header="Habitación" class="col-image">
          <template #body="{ data }">
            <div v-if="data.roomImage">
              <img
                  :src="data.roomImage"
                  :alt="'Habitación ' + data.roomId"
                  class="hotel-image"
                  v-tooltip.top="`Habitación ID: ${data.roomId}`"
              />
            </div>
            <div v-else class="no-image-placeholder">
              <i class="pi pi-image"></i>
            </div>
          </template>
        </Column>

        <Column field="id" header="Res. ID" :sortable="true" class="col-res-id">
          <template #body="{ data }">
            <span class="name-text">{{ data.id }}</span>
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
                          v-tooltip.top="`Días reservados: ${data.daysReserved}`"
                    >
                        {{ data.status }}
                    </span>
          </template>
        </Column>

        <Column field="totalPrice" header="Precio Total" :sortable="true" class="col-price">
          <template #body="{ data }">
            <div class="name-text text-lg">
              {{ data.totalPrice.toLocaleString('es-PE', {style: 'currency', currency: 'PEN'}) }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="reservationStore.errors.length" class="error-message-wrapper">
      <Message severity="error">
        <i class="pi pi-exclamation-triangle error-message-icon"></i> No se pudo obtener la lista de reservas.
      </Message>
    </div>

  </div>
</template>

<style scoped>
/* -------------------------------------- */
/* LAYOUT BASE Y PÁGINA */
/* -------------------------------------- */

.hotels-page-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header-section {
  display: flex;
  justify-content: space-between;
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
  color: #007bff;
  font-size: 1.5rem;
}

/* -------------------------------------- */
/* TABLA Y CONTENEDOR */
/* -------------------------------------- */

.table-card-wrapper {
  background-color: #ffffff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Estilos de PrimeVue internos (usando :deep para modificarlos) */
.hotels-data-table :deep(.p-datatable-header) {
  background-color: #f8f9fa;
  padding: 1.25rem 1.5rem;
  font-weight: 600;
  color: #495057;
}

.hotels-data-table :deep(.p-datatable-thead > tr > th) {
  background-color: #e9ecef;
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
}

.hotels-data-table :deep(.p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

.hotels-data-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: #f1f3f5 !important;
}

/* Estilos de columnas específicas */
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
  width: 10rem;
  text-align: center;
}

.col-price {
  width: 12rem;
  font-weight: 700;
}


/* -------------------------------------- */
/* ESTADO DE CARGA Y ERRORES */
/* -------------------------------------- */

.loading-state {
  padding: 1.5rem;
  text-align: center;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon-pv {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  color: #007bff;
}

.error-message-wrapper {
  margin-top: 1.5rem;
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.1);
  border-radius: 0.5rem;
}

.error-message-icon {
  margin-right: 0.5rem;
  font-size: 1.25rem;
}

/* Clases de Tags de Estado */
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
</style>