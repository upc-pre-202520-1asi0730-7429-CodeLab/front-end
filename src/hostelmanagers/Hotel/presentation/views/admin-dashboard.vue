<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../IAM/application/auth.store.js";
import useHotelStore from "../../application/hotel.store.js";

const authStore = useAuthStore();
const hotelStore = useHotelStore();
const router = useRouter();

const user = computed(() => authStore.user);
const myHotels = computed(() =>
    hotelStore.hotels.filter(h => h.userId === user.value?.id)
);

onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push({ name: "guest-hotels" });
    return;
  }
  await hotelStore.fetchHotels();
});

const goToHotelDetail = (hotelId) => {
  router.push({ name: "admin-hotel-detail", params: { id: hotelId } });
};

const goToCreateHotel = () => {
  router.push({ name: "admin-create-hotel" });
};

const editHotel = (hotelId) => {
  router.push({ name: "admin-update-hotel", params: { id: hotelId } });
};

const deleteHotel = async (hotelId) => {
  if (confirm("Are you sure you want to delete this hotel?")) {
    const success = await hotelStore.deleteHotel(hotelId);
    if (success) {
      alert("Hotel deleted successfully");
      await hotelStore.fetchHotels();
    }
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1 class="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome back, {{ user?.names || user?.username }}</p>
      </div>
      <pv-button
          label="Create New Hotel"
          icon="pi pi-plus"
          size="large"
          @click="goToCreateHotel"
      />
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-blue-100">
              <i class="pi pi-building text-blue-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Total Hotels</p>
              <p class="stat-value">{{ myHotels.length }}</p>
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-green-100">
              <i class="pi pi-calendar text-green-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Active Reservations</p>
              <p class="stat-value">0</p>
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-yellow-100">
              <i class="pi pi-dollar text-yellow-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Total Revenue</p>
              <p class="stat-value">$0.00</p>
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Hotels List -->
    <pv-card class="mt-6">
      <template #title>
        <div class="flex items-center justify-between">
          <span>My Hotels</span>
          <pv-badge :value="myHotels.length" severity="info" />
        </div>
      </template>
      <template #content>
        <div v-if="myHotels.length === 0" class="empty-state">
          <i class="pi pi-building text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-500 mb-4">You don't have any hotels yet</p>
          <pv-button
              label="Create Your First Hotel"
              icon="pi pi-plus"
              @click="goToCreateHotel"
          />
        </div>

        <div v-else class="hotels-grid">
          <pv-card
              v-for="hotel in myHotels"
              :key="hotel.id"
              class="hotel-card"
          >
            <template #header>
              <img
                  :src="hotel.images || 'https://via.placeholder.com/400x250'"
                  :alt="hotel.name"
                  class="hotel-image"
              />
            </template>
            <template #title>{{ hotel.name }}</template>
            <template #content>
              <div class="hotel-info">
                <p class="info-item">
                  <i class="pi pi-map-marker text-red-500"></i>
                  {{ hotel.address }}
                </p>
                <p class="info-item">
                  <i class="pi pi-phone text-blue-500"></i>
                  {{ hotel.phone }}
                </p>
              </div>
            </template>
            <template #footer>
              <div class="hotel-actions">
                <pv-button
                    label="Manage"
                    icon="pi pi-cog"
                    size="small"
                    @click="goToHotelDetail(hotel.id)"
                />
                <pv-button
                    icon="pi pi-pencil"
                    size="small"
                    severity="secondary"
                    outlined
                    @click="editHotel(hotel.id)"
                />
                <pv-button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    outlined
                    @click="deleteHotel(hotel.id)"
                />
              </div>
            </template>
          </pv-card>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.hotel-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.hotel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.hotel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hotel-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.hotel-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .hotels-grid {
    grid-template-columns: 1fr;
  }
}
</style>