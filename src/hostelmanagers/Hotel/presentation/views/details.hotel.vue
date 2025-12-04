<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { HotelsApi } from "../../infrastructure/hotel-api.js";
import useUserStore from '../../../IAM/application/user.store.js';
import {RoomsApi} from "../../../Room/Infrastructure/room-api.js";

defineOptions({
  name: 'DetailsHotel'
});

const route = useRoute();
const router = useRouter();
const toast = useToast();

const hotelsApi = new HotelsApi();
const roomsApi = new RoomsApi();
const userStore = useUserStore();

const hotel = ref(null);
const rooms = ref([]);
const loading = ref(true);
const error = ref(null);

const canViewRooms = computed(() => {
  return userStore.currentUser?.role !== 'Client';
});

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
    const [hotelResponse, roomsResponse] = await Promise.all([
      hotelsApi.getHotelById(hotelId),
      roomsApi.getRoomsByHotelId(hotelId)
    ]);

    if (hotelResponse && hotelResponse.data) {
      hotel.value = hotelResponse.data;
    } else {
      error.value = `No se encontraron detalles para el hotel con ID: ${hotelId}.`;
      loading.value = false;
      return;
    }

    if (roomsResponse && Array.isArray(roomsResponse.data)) {

      rooms.value = roomsResponse.data.filter(
          room => room.hotelId === Number(hotelId)
      );

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

const goBack = () => {
  router.push('/hotels_user');
};

onMounted(fetchHotelDetails);

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

    <div v-if="loading" class="loading-section">
      <div class="loading-content">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando información del hotel...</p>
      </div>
    </div>

    <div v-else-if="error" class="error-section">
      <div class="error-card">
        <i class="pi pi-exclamation-triangle"></i>
        <h2>Error al Cargar</h2>
        <p>{{ error }}</p>
        <pv-button
            label="Volver a Intentar"
            icon="pi pi-refresh"
            @click="fetchHotelDetails"
            class="retry-btn"
        />
      </div>
    </div>

    <div v-else-if="hotel" class="details-content">
      <div class="back-button-wrapper">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver a Hoteles"
            class="back-btn"
            @click="goBack"
        />
      </div>

      <div class="hero-card">
        <div class="hero-image">
          <img
              :src="hotel.images"
              :alt="hotel.name"
              onerror="this.onerror=null; this.src='https://via.placeholder.com/1200x500?text=Hotel'"
          />
          <div class="hero-overlay">
            <div class="hero-content">
              <h1 class="hotel-title">{{ hotel.name }}</h1>
              <p class="hotel-id">ID: {{ hotel.id }}</p>
            </div>
          </div>
        </div>

        <div class="hotel-info-grid">
          <div class="info-card">
            <div class="info-icon">
              <i class="pi pi-map-marker"></i>
            </div>
            <div>
              <h3>Ubicación</h3>
              <p>{{ hotel.address || 'No especificada' }}</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <i class="pi pi-phone"></i>
            </div>
            <div>
              <h3>Contacto</h3>
              <p>{{ hotel.phone || 'No disponible' }}</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <i class="pi pi-user"></i>
            </div>
            <div>
              <h3>ID Propietario</h3>
              <p>{{ hotel.userId || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <pv-button
            v-if="canViewRooms"
            label="Gestionar Habitaciones"
            icon="pi pi-cog"
            class="manage-btn"
            @click="router.push({ path: '/view-rooms', query: { hotelId: hotel.id, hotelName: hotel.name } })"
        />
      </div>

      <div class="rooms-section">
        <div class="section-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="pi pi-home"></i>
            </div>
            <div>
              <h2>Habitaciones Disponibles</h2>
              <p>{{ rooms.length }} habitaciones en {{ hotel.name }}</p>
            </div>
          </div>
        </div>

        <div v-if="rooms.length === 0" class="empty-rooms">
          <i class="pi pi-inbox"></i>
          <h3>Sin Habitaciones</h3>
          <p>Este hotel no tiene habitaciones disponibles para reserva</p>
        </div>

        <div v-else class="rooms-grid">
          <div v-for="room in rooms" :key="room.id" class="room-card">
            <div class="room-image">
              <img
                  :src="room.imagen || 'https://via.placeholder.com/400x300?text=Habitación'"
                  :alt="room.type"
              />
              <div class="room-type-badge">{{ room.type }}</div>
            </div>

            <div class="room-content">
              <div class="room-header">
                <h3 class="room-title">{{ room.type }}</h3>
                <span class="room-id">ID: {{ room.id }}</span>
              </div>

              <div class="room-price">
                <span class="currency">$</span>
                <span class="amount">{{ room.price ? room.price.toLocaleString('es-PE', {minimumFractionDigits: 2}) : '0.00' }}</span>
                <span class="period">/ noche</span>
              </div>

              <pv-button
                  label="Reservar Ahora"
                  icon="pi pi-calendar-plus"
                  class="reserve-btn"
                  @click="router.push({ name: 'ReservationsCreate', params: { id: room.id } })"
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.hotel-details-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  padding: 2rem;
}

.loading-section,
.error-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.loading-spinner {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: float 2s ease-in-out infinite;
}

.loading-spinner i {
  font-size: 3rem;
  color: #f59e0b;
}

.loading-content p {
  font-size: 1.25rem;
  color: #78350f;
  font-weight: 600;
}

.error-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.5s ease-out;
}

.error-card i {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.error-card h2 {
  font-size: 1.75rem;
  color: #1e293b;
  margin: 0 0 1rem;
}

.error-card p {
  color: #64748b;
  margin-bottom: 2rem;
}

.retry-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border: none;
  color: white;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
}

.details-content {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

.back-button-wrapper {
  margin-bottom: 2rem;
}

.back-btn {
  background: white;
  color: #78350f;
  border: 2px solid #fde68a;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #fef3c7;
  transform: translateX(-5px);
}

.hero-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.hero-image {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  padding: 3rem 2rem;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hotel-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.hotel-id {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.hotel-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.2);
}

.info-icon {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon i {
  font-size: 1.75rem;
  color: #f59e0b;
}

.info-card h3 {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.info-card p {
  font-size: 1.125rem;
  color: #78350f;
  margin: 0;
  font-weight: 600;
}

.manage-btn {
  margin: 0 2rem 2rem;
  width: calc(100% - 4rem);
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.manage-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.rooms-section {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #fef3c7;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon i {
  font-size: 2rem;
  color: white;
}

.header-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.header-content p {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.empty-rooms {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 20px;
}

.empty-rooms i {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1.5rem;
}

.empty-rooms h3 {
  font-size: 1.5rem;
  color: #78350f;
  margin: 0 0 0.5rem;
}

.empty-rooms p {
  color: #92400e;
  margin: 0;
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

.room-type-badge {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  font-size: 1.25rem;
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
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
}

.currency {
  font-size: 1.25rem;
  font-weight: 700;
  color: #92400e;
}

.amount {
  font-size: 2rem;
  font-weight: 800;
  color: #78350f;
}

.period {
  font-size: 0.875rem;
  color: #92400e;
}

.reserve-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  color: white;
  padding: 0.875rem;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.reserve-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .hotel-details-container {
    padding: 1rem;
  }

  .hotel-title {
    font-size: 2rem;
  }

  .hotel-info-grid {
    grid-template-columns: 1fr;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>