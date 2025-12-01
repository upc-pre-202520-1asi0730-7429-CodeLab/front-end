<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
// Importar stores
import { useRoomStore } from "../../Application/room.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';
import useHotelStore from "../../../Hotel/application/hotel.store.js";

// 🚀 IMPORTACIONES DE COMPONENTES DE PRIMEVUE FALTANTES
// Es crucial importar los componentes para que Vue los reconozca (p. ej., <pv-divider>)
import PvDivider from 'primevue/divider';
import PvConfirmPopup from 'primevue/confirmpopup';
import PvToast from 'primevue/toast';
import PvDropdown from 'primevue/dropdown';
import PvButton from 'primevue/button';
import PvCard from 'primevue/card';


// --- Stores y Hooks ---
const roomStore = useRoomStore();
const authStore = useAuthStore();
const hotelStore = useHotelStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

// --- Estado local ---
const selectedHotel = ref(null);
const selectedRoom = ref(null);
const loadingHotels = ref(true);

// --- Inicialización y Carga de Hoteles ---

onMounted(async () => {
  const userId = authStore.user?.id;
  loadingHotels.value = true;

  if (userId) {
    // 1. Cargar y filtrar hoteles por el userId actual
    await hotelStore.fetchHotelsByUserId(userId);

    // 2. Intentar seleccionar el hotel
    const hotelsList = hotelStore.hotels;

    if (hotelsList.length > 0) {
      // Revisar si el hotelId de la ruta es válido
      const routeId = parseInt(route.params.hotelId);
      const initialHotel = hotelsList.find(h => h.id === routeId);

      // Seleccionar el de la ruta o el primero
      selectedHotel.value = initialHotel || hotelsList[0];
    }
  }
  loadingHotels.value = false;
});

// --- Observador para cargar habitaciones al seleccionar hotel ---
watch(selectedHotel, (newHotel) => {
  if (newHotel && newHotel.id) {
    // Cargar las habitaciones del hotel seleccionado
    roomStore.fetchRoomsByHotelId(newHotel.id).then(() => {
      // 💡 DEBUG: Log para ver el valor de la imagen
      if (roomStore.rooms.length > 0) {
        console.log("------------------ DEBUG IMAGEN ------------------");
        console.log("Habitaciones cargadas. Cantidad:", roomStore.rooms.length);
        console.log("Valor de roomStore.rooms[0].imagen:", roomStore.rooms[0].imagen);
        console.log("--------------------------------------------------");
      }
    });
  } else {
    roomStore.rooms = []; // Limpiar si no hay hotel seleccionado
  }
}, { immediate: false });

// --- Funciones de Acción ---

const handleDelete = (event, id, roomType) => {
  confirm.require({
    target: event.currentTarget,
    message: `¿Está seguro de eliminar la habitación tipo "${roomType}"?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger p-button-sm',
    rejectClass: 'p-button-text p-button-sm',
    accept: async () => {
      const success = await roomStore.deleteRoom(id);
      if (success) {
        toast.add({severity: 'success', summary: 'Eliminada', detail: `Habitación "${roomType}" eliminada con éxito.`, life: 3000});
      } else {
        toast.add({severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la habitación.', life: 5000});
      }
    }
  });
};

const navigateToCreateRoom = () => {
  if (selectedHotel.value?.id) {
    router.push({
      name: 'CreateRooms',
      params: { hotelId: selectedHotel.value.id }
    });
  }
};

const navigateToEditRoom = (roomId) => {
  if (selectedHotel.value?.id) {
    router.push({
      name: 'edit-room',
      params: {
        id: roomId,             // 👈 Se mapea al parámetro ':id' (Habitación)
        hotelId: selectedHotel.value.id // 👈 Se mapea al parámetro ':hotelId' (Hotel)
      }
    });
  }
}
</script>

<template>
  <div class="p-4 max-w-7xl mx-auto">

    <pv-toast position="top-right" />

    <div class="header-controls-container">
      <h1 class="text-3xl font-bold text-gray-800">Gestión de Habitaciones</h1>

      <div class="controls-group">

        <div class="hotel-select-group">
          <label for="hotel-selector" class="block text-sm font-medium text-gray-700 mr-2">
            Ver habitaciones de:
          </label>
          <pv-dropdown
              id="hotel-selector"
              v-model="selectedHotel"
              :options="hotelStore.hotels"
              optionLabel="name"
              placeholder="Seleccione un hotel"
              :loading="loadingHotels"
              :disabled="hotelStore.hotels.length === 0 || loadingHotels"
              class="w-full md:w-14rem"
          />
        </div>

        <pv-button
            v-if="selectedHotel"
            label="Crear Habitación"
            icon="pi pi-plus"
            severity="success"
            @click="navigateToCreateRoom"
            :disabled="roomStore.loading"
        />
      </div>
    </div>

    <pv-divider />

    <pv-confirm-popup></pv-confirm-popup>

    <div v-if="roomStore.loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Cargando habitaciones...</p>
    </div>

    <div v-else-if="!selectedHotel && hotelStore.hotels.length > 0" class="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
      <p class="text-lg text-yellow-800 font-semibold">
        Seleccione uno de sus hoteles del menú desplegable para ver y gestionar sus habitaciones.
      </p>
    </div>

    <div v-else-if="selectedHotel && roomStore.rooms.length === 0" class="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <i class="pi pi-info-circle text-4xl text-gray-500"></i>
      <p class="mt-2 text-lg font-semibold text-gray-700">
        No hay habitaciones registradas para el hotel "{{ selectedHotel.name }}".
      </p>
      <pv-button
          label="Crear la primera habitación"
          icon="pi pi-plus"
          class="mt-4"
          @click="navigateToCreateRoom"
      />
    </div>

    <div v-else-if="!selectedHotel && hotelStore.hotels.length === 0 && !loadingHotels" class="text-center p-8 bg-red-50 rounded-lg border border-red-200">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
      <p class="mt-2 text-lg font-semibold text-red-700">
        No tienes hoteles asociados. Crea uno primero para poder registrar habitaciones.
      </p>
    </div>

    <div v-else class="rooms-grid-container">
      <pv-card v-for="room in roomStore.rooms" :key="room.id" class="room-card">

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
          <span class="price-text">${{ room.price ? room.price.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '0.00' }} / noche</span>
        </template>

        <template #content>
          <div class="room-id-tag">ID: {{ room.id }}</div>
        </template>

        <template #footer>
          <div class="card-actions">

            <pv-button
                label="Editar"
                severity="info"
                size="small"
                icon="pi pi-pencil"
                @click="navigateToEditRoom(room.id)"
            />
            <pv-button
                label="Eliminar"
                severity="danger"
                size="small"
                icon="pi pi-trash"
                @click="handleDelete($event, room.id, room.type)"
            />

          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para el nuevo diseño */
.header-controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.controls-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.hotel-select-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Contenedor de la cuadrícula de tarjetas */
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
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

/* Estilos de PrimeVue internos (para Card) */
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

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}
</style>