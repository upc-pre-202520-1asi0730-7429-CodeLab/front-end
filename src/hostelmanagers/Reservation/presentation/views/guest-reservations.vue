<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import useReservationStore from "../../application/reservation.store.js";
import { useAuthStore } from "../../../IAM/application/auth.store.js";

const reservationStore = useReservationStore();
const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.user);
const myReservations = computed(() =>
    reservationStore.reservations.filter(r => r.userId === user.value?.id)
);

const upcomingReservations = computed(() =>
    myReservations.value.filter(r => r.status === "pending" || r.status === "checked-in")
);

const pastReservations = computed(() =>
    myReservations.value.filter(r => r.status === "checked-out")
);

onMounted(async () => {
  if (user.value) {
    await reservationStore.fetchReservationsByUserId(user.value.id);
  }
});

const getStatusSeverity = (status) => {
  const severityMap = {
    "pending": "warning",
    "checked-in": "info",
    "checked-out": "success",
    "cancelled": "danger"
  };
  return severityMap[status] || "secondary";
};

const goToBrowseHotels = () => {
  router.push({ name: "guest-hotels" });
};
</script>

<template>
  <div class="my-reservations-container">
    <div class="page-header">
      <div>
        <h1 class="text-4xl font-bold text-gray-800">My Reservations</h1>
        <p class="text-gray-600 mt-2">Manage your bookings</p>
      </div>
      <pv-button
          label="Browse Hotels"
          icon="pi pi-search"
          @click="goToBrowseHotels"
      />
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-blue-100">
              <i class="pi pi-calendar text-blue-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Total Reservations</p>
              <p class="stat-value text-blue-600">{{ myReservations.length }}</p>
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-orange-100">
              <i class="pi pi-clock text-orange-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Upcoming</p>
              <p class="stat-value text-orange-600">{{ upcomingReservations.length }}</p>
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-green-100">
              <i class="pi pi-check-circle text-green-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Completed</p>
              <p class="stat-value text-green-600">{{ pastReservations.length }}</p>
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Reservations List -->
    <pv-card class="mt-6">
      <template #title>All Reservations</template>
      <template #content>
        <div v-if="myReservations.length === 0" class="empty-state">
          <i class="pi pi-calendar-times text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-500 mb-2">No reservations yet</p>
          <p class="text-gray-400 mb-4">Start exploring hotels and make your first booking</p>
          <pv-button
              label="Browse Hotels"
              icon="pi pi-search"
              @click="goToBrowseHotels"
          />
        </div>

        <pv-data-table
            v-else
            :value="myReservations"
            striped-rows
            responsive-layout="scroll"
            paginator
            :rows="10"
        >
          <pv-column field="checkInDate" header="Check-in" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-blue-500"></i>
                <span>{{ data.checkInDate }}</span>
              </div>
            </template>
          </pv-column>

          <pv-column field="checkOutDate" header="Check-out" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-red-500"></i>
                <span>{{ data.checkOutDate }}</span>
              </div>
            </template>
          </pv-column>

          <pv-column field="status" header="Status" sortable>
            <template #body="{ data }">
              <pv-tag
                  :value="data.status"
                  :severity="getStatusSeverity(data.status)"
              />
            </template>
          </pv-column>

          <pv-column field="totalPrice" header="Total" sortable>
            <template #body="{ data }">
              <span class="text-lg font-bold text-green-600">${{ data.totalPrice.toFixed(2) }}</span>
            </template>
          </pv-column>

          <pv-column header="Details">
            <template #body="{ data }">
              <div class="reservation-details">
                <p class="text-sm text-gray-600">
                  <strong>Guest:</strong> {{ data.guestName }}
                </p>
                <p class="text-sm text-gray-600">
                  <strong>Email:</strong> {{ data.guestEmail }}
                </p>
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.my-reservations-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
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
}

.empty-state {
  text-align: center;
  padding: 6rem 2rem;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>