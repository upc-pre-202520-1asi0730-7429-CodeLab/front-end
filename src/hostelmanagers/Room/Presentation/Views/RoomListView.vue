<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRoomStore } from "../../Application/room.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';
import useHotelStore from "../../../Hotel/application/hotel.store.js";

const roomStore = useRoomStore();
const authStore = useAuthStore();
const hotelStore = useHotelStore();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

const selectedHotel = ref(null);
const loadingHotels = ref(true);

onMounted(async () => {
  const userId = authStore.user?.id;
  loadingHotels.value = true;

  if (userId) {
    await hotelStore.fetchHotelsByUserId(userId);
    const hotelsList = hotelStore.hotels;

    if (hotelsList.length > 0) {
      const routeId = parseInt(route.params.hotelId);
      const initialHotel = hotelsList.find(h => h.id === routeId);
      selectedHotel.value = initialHotel || hotelsList[0];
    }
  }
  loadingHotels.value = false;
});

watch(selectedHotel, (newHotel) => {
  if (newHotel && newHotel.id) {
    roomStore.fetchRoomsByHotelId(newHotel.id);
  } else {
    roomStore.rooms = [];
  }
}, { immediate: false });

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
        id: roomId,
        hotelId: selectedHotel.value.id
      }
    });
  }
}
</script>

<template>
  <div class="rooms-container">
    <pv-toast position="top-right" />
    <pv-confirm-popup></pv-confirm-popup>

    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <div class="icon-badge">
            <i class="pi pi-home"></i>
          </div>
          <div>
            <h1 class="page-title">Gestión de Habitaciones</h1>
            <p class="page-subtitle">Administra tus espacios hoteleros</p>
          </div>
        </div>

        <div class="header-controls">
          <div class="hotel-selector-wrapper">
            <label for="hotel-selector" class="selector-label">
              <i class="pi pi-building"></i>
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
                class="hotel-dropdown"
            />
          </div>

          <pv-button
              v-if="selectedHotel"
              label="Crear Habitación"
              icon="pi pi-plus"
              class="create-btn"
              @click="navigateToCreateRoom"
              :disabled="roomStore.loading"
          />
        </div>
      </div>
    </div>

    <div class="content-area">
      <div v-if="roomStore.loading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando habitaciones...</p>
      </div>

      <div v-else-if="!selectedHotel && hotelStore.hotels.length > 0" class="empty-state warning">
        <i class="pi pi-info-circle"></i>
        <h3>Selecciona un Hotel</h3>
        <p>Elige uno de tus hoteles del menú desplegable para gestionar sus habitaciones</p>
      </div>

      <div v-else-if="selectedHotel && roomStore.rooms.length === 0" class="empty-state info">
        <i class="pi pi-home"></i>
        <h3>Sin Habitaciones</h3>
        <p>No hay habitaciones registradas para "{{ selectedHotel.name }}"</p>
        <pv-button
            label="Crear la primera habitación"
            icon="pi pi-plus"
            class="empty-action-btn"
            @click="navigateToCreateRoom"
        />
      </div>

      <div v-else-if="!selectedHotel && hotelStore.hotels.length === 0 && !loadingHotels" class="empty-state error">
        <i class="pi pi-exclamation-triangle"></i>
        <h3>Sin Hoteles</h3>
        <p>No tienes hoteles asociados. Crea uno primero para poder registrar habitaciones</p>
      </div>

      <div v-else class="rooms-grid">
        <div v-for="room in roomStore.rooms" :key="room.id" class="room-card">
          <div class="room-image">
            <img
                :src="room.imagen || 'https://via.placeholder.com/280x180?text=SIN+IMAGEN'"
                :alt="room.type"
            />
            <div class="room-overlay">
              <span class="room-type-badge">{{ room.type }}</span>
            </div>
          </div>

          <div class="room-content">
            <div class="room-header">
              <h3 class="room-title">{{ room.type }}</h3>
              <span class="room-id">ID: {{ room.id }}</span>
            </div>

            <div class="room-price">
              <span class="currency">$</span>
              <span class="amount">{{ room.price ? room.price.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '0.00' }}</span>
              <span class="period">/ noche</span>
            </div>

            <div class="room-actions">
              <pv-button
                  label="Editar"
                  icon="pi pi-pencil"
                  class="action-btn edit-btn"
                  @click="navigateToEditRoom(room.id)"
              />
              <pv-button
                  label="Eliminar"
                  icon="pi pi-trash"
                  class="action-btn delete-btn"
                  @click="handleDelete($event, room.id, room.type)"
              />
            </div>
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

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.rooms-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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

.header-title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hotel-selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selector-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hotel-dropdown {
  min-width: 250px;
}

.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.content-area {
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner i {
  font-size: 2.5rem;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state.warning i {
  color: #f59e0b;
}

.empty-state.info i {
  color: #3b82f6;
}

.empty-state.error i {
  color: #ef4444;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 1.5rem;
}

.empty-action-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.room-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideInRight 0.5s ease-out;
}

.room-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.room-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.room-card:hover .room-image img {
  transform: scale(1.1);
}

.room-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
  display: flex;
  align-items: flex-end;
  padding: 1rem;
}

.room-type-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.room-content {
  padding: 1.5rem;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.room-title {
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
}

.room-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 12px;
}

.currency {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #047857;
}

.period {
  font-size: 0.875rem;
  color: #64748b;
  margin-left: 0.25rem;
}

.room-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: none;
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  border: none;
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title-section {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>