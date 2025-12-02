<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { HotelsApi } from "../../infrastructure/hotel-api.js";
import useUserStore from '../../../IAM/application/user.store.js';

// 🔑 Importación de componentes de PrimeVue
import PvDivider from 'primevue/divider';
import PvCard from 'primevue/card';
import {RoomsApi} from "../../../Room/Infrastructure/room-api.js";

defineOptions({
  name: 'DetailsHotel'
});

// --- Inicialización ---
const route = useRoute();
const router = useRouter();
const toast = useToast();

const hotelsApi = new HotelsApi();
const roomsApi = new RoomsApi(); // 🔑 Instancia del API de Habitaciones
const userStore = useUserStore();

// --- Estados Reactivos ---
const hotel = ref(null);
const rooms = ref([]); // 🔑 Estado para las habitaciones
const loading = ref(true);
const error = ref(null);

// --- Propiedad Computada de Permisos ---

/**
 * Propiedad computada para determinar si el usuario puede ver el botón de gestión de habitaciones.
 * Asumimos que es para roles de Admin/Manager, no para 'Client'.
 */
const canViewRooms = computed(() => {
  return userStore.currentUser?.role !== 'Client';
});


// --- Lógica ---

/**
 * Obtiene el ID del hotel de la ruta, carga sus detalles y las habitaciones asociadas.
 */
const fetchHotelDetails = async () => {
  const hotelId = route.params.id;
  loading.value = true;
  error.value = null;
  hotel.value = null;
  rooms.value = [];

  if (!hotelId) {
    error.value = 'ID del hotel no proporcionado en la ruta.';
    loading.value = false;
    return;
  }

  try {
    // 1. Cargar detalles del Hotel
    const [hotelResponse, roomsResponse] = await Promise.all([
      hotelsApi.getHotelById(hotelId),
      roomsApi.getRoomsByHotelId(hotelId) // 🔑 Carga de habitaciones por ID
    ]);

    // Procesar respuesta del Hotel
    if (hotelResponse && hotelResponse.data) {
      hotel.value = hotelResponse.data;
    } else {
      error.value = `No se encontraron detalles para el hotel con ID: ${hotelId}.`;
      loading.value = false;
      return;
    }

    // Procesar respuesta de las Habitaciones
    if (roomsResponse && Array.isArray(roomsResponse.data)) {
      rooms.value = roomsResponse.data;
    } else {
      rooms.value = [];
    }

  } catch (err) {
    console.error('Error al obtener datos:', err);
    error.value = `Fallo al cargar los datos: ${err.message || 'Error de conexión.'}`;
  } finally {
    loading.value = false;

    if (error.value) {
      toast.add({
        severity: 'error',
        summary: 'Error de Carga',
        detail: error.value,
        life: 5000
      });
    }
  }
};

/**
 * Función para volver a la vista de listado de hoteles.
 */
const goBack = () => {
  router.push('/view-hotels');
};

// --- Ciclo de Vida ---
onMounted(fetchHotelDetails);

// Recargar si el ID de la ruta cambia
watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        fetchHotelDetails();
      }
    }
);
</script>

<template>
  <div class="hotel-details-container">

    <pv-toast position="top-right"/>

    <div class="header-details-section">
      <pv-button
          icon="pi pi-arrow-left"
          label="Volver a Hoteles"
          class="p-button-secondary p-button-text p-button-sm mb-4"
          @click="goBack"
      />
      <h1 class="page-title-main">
        <i class="pi pi-building header-icon"></i>
        Detalles del Hotel
      </h1>
    </div>

    <div v-if="loading" class="loading-panel">
      <i class="pi pi-spin pi-spinner loading-icon"></i> Cargando detalles del hotel...
    </div>

    <div v-else-if="error" class="error-panel">
      <pv-message severity="error">{{ error }}</pv-message>
    </div>

    <div v-else-if="hotel" class="details-wrapper">

      <div class="details-card-wrapper mb-8">
        <div class="hotel-image-display">
          <img
              :src="hotel.images"
              :alt="'Imagen de ' + hotel.name"
              class="main-hotel-image"
              onerror="this.onerror=null; this.src='https://via.placeholder.com/600x300?text=Imagen+no+disponible';"
          />
        </div>

        <div class="details-content">
          <h2 class="hotel-name">{{ hotel.name }}</h2>
          <p class="hotel-id-info">ID Interno: {{ hotel.id }}</p>

          <div class="details-group">
            <div class="detail-item">
              <i class="pi pi-map-marker"></i>
              <span class="detail-label">Dirección:</span>
              <p class="detail-value">{{ hotel.address || 'No especificada' }}</p>
            </div>

            <div class="detail-item">
              <i class="pi pi-phone"></i>
              <span class="detail-label">Teléfono:</span>
              <p class="detail-value">{{ hotel.phone || 'No disponible' }}</p>
            </div>

            <div class="detail-item">
              <i class="pi pi-user-plus"></i>
              <span class="detail-label">ID del Propietario:</span>
              <p class="detail-value">{{ hotel.userId || 'N/A' }}</p>
            </div>
          </div>

          <pv-button
              v-if="canViewRooms"
              label="Ver y Gestionar Habitaciones"
              icon="pi pi-home"
              class="p-button-secondary mt-4"
              @click="router.push({ path: '/view-rooms', query: { hotelId: hotel.id, hotelName: hotel.name } })"
          />

        </div>
      </div>

      <pv-divider/>

      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <i class="pi pi-home mr-2 text-blue-500"></i>
        Habitaciones disponibles para reserva en {{ hotel.name }} ({{ rooms.length }})
      </h3>

      <div v-if="rooms.length === 0" class="no-rooms-message">
        <i class="pi pi-info-circle text-3xl mb-2"></i>
        <p>Este hotel no tiene habitaciones registradas o disponibles para reserva.</p>
      </div>

      <div v-else class="rooms-grid-container">
        <pv-card v-for="room in rooms" :key="room.id" class="room-card">
          <template #header>
            <img
                :src="room.imagen || 'https://via.placeholder.com/280x180?text=SIN+IMAGEN'"
                alt="Imagen de la Habitación"
                class="card-image"
            />
          </template>

          <template #title>
            {{ room.type }}
          </template>

          <template #subtitle>
            <span class="price-text">${{
                room.price ? room.price.toLocaleString('es-PE', {minimumFractionDigits: 2}) : '0.00'
              }} / noche</span>
          </template>

          <template #content>
            <div class="room-id-tag">ID: {{ room.id }}</div>
          </template>

          <template #footer>
            <pv-button
                label="Reservar Ahora"
                severity="success"
                icon="pi pi-calendar-plus"
                size="small"
                @click="router.push({ name: 'create-reservation', query: { roomId: room.id, hotelId: hotel.id } })"
            />
          </template>
        </pv-card>
      </div>

    </div>

    <div v-else class="error-panel">
      <pv-message severity="warn">No se pudo cargar la información del hotel.</pv-message>
    </div>

  </div>
</template>

<style scoped>
/* Estilos para el contenedor principal de los detalles */
.hotel-details-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-details-section {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 2rem;
}

.page-title-main {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.header-icon {
  margin-right: 0.75rem;
  color: #007bff;
  font-size: 1.5rem;
}

/* Estilos de la Tarjeta de Detalles del Hotel */
.details-card-wrapper {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.hotel-image-display {
  height: 300px;
  overflow: hidden;
}

.main-hotel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-content {
  padding: 2rem;
}

.hotel-name {
  font-size: 2rem;
  color: #343a40;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.hotel-id-info {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.details-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
}

.detail-item i {
  font-size: 1.25rem;
  color: #007bff;
  margin-right: 1rem;
  margin-top: 3px;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  width: 120px;
  flex-shrink: 0;
}

.detail-value {
  margin: 0;
  color: #6c757d;
  flex-grow: 1;
}

/* Estilos de la Cuadrícula de Habitaciones */
.rooms-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding-top: 1rem;
}

.room-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.room-card :deep(.p-card-header) {
  padding: 0;
}

.room-card :deep(.p-card-content) {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.room-card :deep(.p-card-footer) {
  padding-top: 0;
}

.price-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
}

.room-id-tag {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.no-rooms-message {
  text-align: center;
  padding: 2rem;
  background-color: #fffbe6;
  border: 1px solid #ffe999;
  color: #856404;
  border-radius: 0.5rem;
}

/* Estilos de carga y error */
.loading-panel, .error-panel {
  padding: 2rem;
  text-align: center;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-icon {
  margin-right: 0.5rem;
  font-size: 1.5rem;
  color: #007bff;
}
</style>