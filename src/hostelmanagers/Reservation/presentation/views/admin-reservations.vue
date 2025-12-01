<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import useReservationStore from "../../application/reservation.store.js";
import useHotelStore from "../../../Hotel/application/hotel.store.js";

const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();
const hotelStore = useHotelStore();

const hotelId = ref(parseInt(route.params.hotelId));
const activeTab = ref(0);
const hotel = computed(() => hotelStore.currentHotel);

const reservations = computed(() => reservationStore.reservations);
const pendingCheckIns = computed(() => reservationStore.pendingCheckIns);
const pendingCheckOuts = computed(() => reservationStore.pendingCheckOuts);

onMounted(async () => {
  await hotelStore.fetchHotelById(hotelId.value);
  await reservationStore.fetchReservationsByHotelId(hotelId.value);
});

const handleCheckIn = async (reservationId) => {
  if (confirm("Confirm check-in for this reservation?")) {
    const success = await reservationStore.performCheckIn(reservationId);
    if (success) {
      alert("Check-in completed successfully");
      await reservationStore.fetchReservationsByHotelId(hotelId.value);
    }
  }
};

const handleCheckOut = async (reservationId) => {
  if (confirm("Confirm check-out for this reservation?")) {
    const success = await reservationStore.performCheckOut(reservationId);
    if (success) {
      alert("Check-out completed successfully");
      await reservationStore.fetchReservationsByHotelId(hotelId.value);
    }
  }
};

const getStatusSeverity = (status) => {
  const severityMap = {
    "pending": "warning",
    "checked-in": "info",
    "checked-out": "success",
    "cancelled": "danger"
  };
  return severityMap[status] || "secondary";
};

const goBack = () => {
  router.push({ name: "admin-hotel-detail", params: { id: hotelId.value } });
};
</script>

<template>
  <div class="reservations-container">
    <div class="page-header">
      <div class="flex items-center gap-4">
        <pv-button
            icon="pi pi-arrow-left"
            rounded
            text
            @click="goBack"
        />
        <div>
          <h1 class="text-4xl font-bold text-gray-800">Reservations Management</h1>
          <p class="text-gray-600 mt-1">{{ hotel?.name }}</p>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-orange-100">
              <i class="pi pi-clock text-orange-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Pending Check-ins</p>
              <p class="stat-value text-orange-600">{{ pendingCheckIns.length }}</p>
            </div>
          </div>
        </template>
      </pv-card>

      <pv-card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon bg-blue-100">
              <i class="pi pi-home text-blue-600 text-3xl"></i>
            </div>
            <div>
              <p class="stat-label">Checked In</p>
              <p class="stat-value text-blue-600">{{ pendingCheckOuts.length }}</p>
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
              <p class="stat-label">Total Reservations</p>
              <p class="stat-value text-green-600">{{ reservations.length }}</p>
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Tabs -->
    <pv-card class="mt-6">
      <template #content>
        <pv-tab-view v-model:active-index="activeTab">
          <!-- Pending Check-ins Tab -->
          <pv-tab-panel>
            <template #header>
              <div class="flex items-center gap-2">
                <i class="pi pi-clock"></i>
                <span>Pending Check-ins</span>
                <pv-badge :value="pendingCheckIns.length" severity="warning" />
              </div>
            </template>

            <pv-data-table
                :value="pendingCheckIns"
                striped-rows
                responsive-layout="scroll"
                paginator
                :rows="10"
            >
              <template #empty>
                <div class="empty-state-small">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-2"></i>
                  <p class="text-gray-500">No pending check-ins</p>
                </div>
              </template>

              <pv-column field="guestName" header="Guest Name" sortable></pv-column>
              <pv-column field="guestEmail" header="Email"></pv-column>
              <pv-column field="checkInDate" header="Check-in Date" sortable></pv-column>
              <pv-column field="checkOutDate" header="Check-out Date"></pv-column>
              <pv-column field="totalPrice" header="Total">
                <template #body="{ data }">
                  <span class="font-semibold text-green-600">${{ data.totalPrice.toFixed(2) }}</span>
                </template>
              </pv-column>
              <pv-column header="Actions">
                <template #body="{ data }">
                  <pv-button
                      label="Check In"
                      icon="pi pi-check"
                      size="small"
                      severity="success"
                      @click="handleCheckIn(data.id)"
                  />
                </template>
              </pv-column>
            </pv-data-table>
          </pv-tab-panel>

          <!-- Pending Check-outs Tab -->
          <pv-tab-panel>
            <template #header>
              <div class="flex items-center gap-2">
                <i class="pi pi-sign-out"></i>
                <span>Pending Check-outs</span>
                <pv-badge :value="pendingCheckOuts.length" severity="info" />
              </div>
            </template>

            <pv-data-table
                :value="pendingCheckOuts"
                striped-rows
                responsive-layout="scroll"
                paginator
                :rows="10"
            >
              <template #empty>
                <div class="empty-state-small">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-2"></i>
                  <p class="text-gray-500">No pending check-outs</p>
                </div>
              </template>

              <pv-column field="guestName" header="Guest Name" sortable></pv-column>
              <pv-column field="guestEmail" header="Email"></pv-column>
              <pv-column field="checkInDate" header="Check-in Date"></pv-column>
              <pv-column field="checkOutDate" header="Check-out Date" sortable></pv-column>
              <pv-column field="totalPrice" header="Total">
                <template #body="{ data }">
                  <span class="font-semibold text-green-600">${{ data.totalPrice.toFixed(2) }}</span>
                </template>
              </pv-column>
              <pv-column header="Actions">
                <template #body="{ data }">
                  <pv-button
                      label="Check Out"
                      icon="pi pi-sign-out"
                      size="small"
                      severity="info"
                      @click="handleCheckOut(data.id)"
                  />
                </template>
              </pv-column>
            </pv-data-table>
          </pv-tab-panel>

          <!-- All Reservations Tab -->
          <pv-tab-panel>
            <template #header>
              <div class="flex items-center gap-2">
                <i class="pi pi-list"></i>
                <span>All Reservations</span>
              </div>
            </template>

            <pv-data-table
                :value="reservations"
                striped-rows
                responsive-layout="scroll"
                paginator
                :rows="10"
            >
              <template #empty>
                <div class="empty-state-small">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-2"></i>
                  <p class="text-gray-500">No reservations yet</p>
                </div>
              </template>

              <pv-column field="guestName" header="Guest Name" sortable></pv-column>
              <pv-column field="checkInDate" header="Check-in" sortable></pv-column>
              <pv-column field="checkOutDate" header="Check-out" sortable></pv-column>
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
                  <span class="font-semibold text-green-600">${{ data.totalPrice.toFixed(2) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </pv-tab-panel>
        </pv-tab-view>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.reservations-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
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

.empty-state-small {
  text-align: center;
  padding: 3rem 1rem;
}
</style>