<script setup>
import { onMounted, watch, ref, computed } from "vue";
import { useRouter } from 'vue-router';
import useHotelStore from "../../application/hotel.store.js";
import { useToast } from 'primevue/usetoast';
import Tooltip from 'primevue/tooltip';
import InputText from 'primevue/inputtext';

defineOptions({
  name: 'ClientHotelView'
});

const store = useHotelStore();
const toast = useToast();
const router = useRouter();
const vTooltip = Tooltip;

const globalFilter = ref('');

const filteredHotels = computed(() => {
  if (!globalFilter.value) {
    return store.hotels;
  }
  const filterText = globalFilter.value.toLowerCase();

  return store.hotels.filter(hotel => {
    return hotel.name.toLowerCase().includes(filterText);
  });
});

onMounted(() => {
  store.fetchHotels();
});

watch(
    () => store.errors.length,
    (newErrorsCount) => {
      if (newErrorsCount > 0) {
        toast.add({
          severity: 'error',
          summary: 'Error de Carga',
          detail: 'No se pudieron cargar los hoteles. Por favor, intente de nuevo.',
          life: 5000
        });
      }
    }
);

const viewHotelDetails = (id) => {
  router.push(`/hotels/details/${id}`);
};
</script>

<template>
  <div class="client-hotels-container">
    <Toast position="top-right"/>

    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-compass"></i>
        </div>
        <h1 class="hero-title">Descubre Hoteles Increíbles</h1>
        <p class="hero-subtitle">Encuentra el lugar perfecto para tu próxima aventura</p>
      </div>
    </div>

    <div class="search-section">
      <div class="search-wrapper">
        <span class="p-input-icon-left search-input-wrapper">
          <i class="pi pi-search" />
          <InputText
              v-model="globalFilter"
              placeholder="Buscar hoteles por nombre..."
              class="search-input"
          />
        </span>
      </div>
    </div>

    <div v-if="store.loading" class="loading-state">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p>Buscando hoteles disponibles...</p>
    </div>

    <div v-else-if="filteredHotels.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>No se encontraron hoteles</h3>
      <p v-if="globalFilter">Intenta con otro término de búsqueda</p>
      <p v-else>No hay hoteles disponibles en este momento</p>
    </div>

    <div v-else class="hotels-grid">
      <div v-for="hotel in filteredHotels" :key="hotel.id" class="hotel-card" @click="viewHotelDetails(hotel.id)">
        <div class="hotel-image">
          <img
              v-if="hotel.images && typeof hotel.images === 'string'"
              :src="hotel.images"
              :alt="hotel.name"
          />
          <div v-else class="no-image">
            <i class="pi pi-image"></i>
          </div>
          <div class="hotel-overlay">
            <button class="view-btn">
              <i class="pi pi-eye"></i>
              <span>Ver Detalles</span>
            </button>
          </div>
        </div>

        <div class="hotel-content">
          <div class="hotel-header">
            <h3 class="hotel-name">{{ hotel.name }}</h3>
            <span class="hotel-id">ID: {{ hotel.id }}</span>
          </div>

          <div class="hotel-info">
            <div class="info-item">
              <i class="pi pi-map-marker"></i>
              <span>{{ hotel.address }}</span>
            </div>

            <div class="info-item">
              <i class="pi pi-phone"></i>
              <span>{{ hotel.phone }}</span>
            </div>
          </div>

          <div class="hotel-actions">
            <button class="details-btn" @click.stop="viewHotelDetails(hotel.id)">
              <i class="pi pi-info-circle"></i>
              <span>Ver Detalles y Habitaciones</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.errors.length" class="error-section">
      <Message severity="error">
        <div class="error-content">
          <i class="pi pi-exclamation-triangle"></i>
          <span>No se pudo obtener la lista de hoteles.</span>
        </div>
      </Message>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.client-hotels-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem 2rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.hero-icon i {
  font-size: 3.5rem;
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 300;
}

.search-section {
  max-width: 600px;
  margin: 0 auto 3rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.search-wrapper {
  background: white;
  border-radius: 20px;
  padding: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.search-input-wrapper {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  background: transparent;
}

.search-input:focus {
  outline: none;
  box-shadow: none;
}

.search-input-wrapper i {
  left: 1.25rem;
  color: #667eea;
  font-size: 1.25rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  animation: fadeInUp 0.5s ease-out;
}

.loading-spinner {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 2s ease-in-out infinite;
}

.loading-spinner i {
  font-size: 3rem;
  color: white;
}

.loading-state p {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: scaleIn 0.5s ease-out;
}

.empty-state i {
  font-size: 5rem;
  color: #667eea;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.75rem;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.hotel-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  cursor: pointer;
  animation: scaleIn 0.5s ease-out;
}

.hotel-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.hotel-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.hotel-card:hover .hotel-image img {
  transform: scale(1.15);
}

.no-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image i {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.5);
}

.hotel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hotel-card:hover .hotel-overlay {
  opacity: 1;
}

.view-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.hotel-content {
  padding: 1.75rem;
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.hotel-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.hotel-id {
  font-size: 0.75rem;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
}

.hotel-info {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
}

.info-item i {
  color: #667eea;
  font-size: 1.125rem;
}

.hotel-actions {
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.details-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.error-section {
  max-width: 600px;
  margin: 2rem auto 0;
  animation: fadeInUp 0.5s ease-out;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #991b1b;
}

.error-content i {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .client-hotels-container {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hotels-grid {
    grid-template-columns: 1fr;
  }
}
</style>