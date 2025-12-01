<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";
import useRoomStore from "../../../Room/application/room.store.js";

const route = useRoute();
const router = useRouter();
const hotelStore = useHotelStore();
const roomStore = useRoomStore();

const hotelId = ref(parseInt(route.params.id));
const hotel = computed(() => hotelStore.currentHotel);
const rooms = computed(() => roomStore.rooms);

const showRoomDialog = ref(false);
const editingRoom = ref(null);
const roomForm = ref({
  image: "",
  type: "",
  price: 0,
  isAvailable: true
});

const roomTypes = [
  { label: "Single Room", value: "single" },
  { label: "Double Room", value: "double" },
  { label: "Suite", value: "suite" },
  { label: "Deluxe Suite", value: "deluxe" }
];

onMounted(async () => {
  await hotelStore.fetchHotelById(hotelId.value);
  await roomStore.fetchRoomsByHotelId(hotelId.value);
});

const openCreateRoomDialog = () => {
  editingRoom.value = null;
  roomForm.value = {
    image: "",
    type: "",
    price: 0,
    isAvailable: true
  };
  showRoomDialog.value = true;
};

const openEditRoomDialog = (room) => {
  editingRoom.value = room;
  roomForm.value = { ...room };
  showRoomDialog.value = true;
};

const saveRoom = async () => {
  const success = editingRoom.value
      ? await roomStore.updateRoom(editingRoom.value.id, {
        ...roomForm.value,
        hotelId: hotelId.value
      })
      : await roomStore.createRoom({
        ...roomForm.value,
        hotelId: hotelId.value
      });

  if (success) {
    showRoomDialog.value = false;
    await roomStore.fetchRoomsByHotelId(hotelId.value);
    alert(editingRoom.value ? "Room updated successfully" : "Room created successfully");
  }
};

const deleteRoom = async (roomId) => {
  if (confirm("Are you sure you want to delete this room?")) {
    const success = await roomStore.deleteRoom(roomId);
    if (success) {
      await roomStore.fetchRoomsByHotelId(hotelId.value);
      alert("Room deleted successfully");
    }
  }
};

const goToReservations = () => {
  router.push({ name: "admin-reservations", params: { hotelId: hotelId.value } });
};

const goBack = () => {
  router.push({ name: "admin-dashboard" });
};
</script>

<template>
  <div class="hotel-detail-container">
    <div class="detail-header">
      <div class="flex items-center gap-4">
        <pv-button
            icon="pi pi-arrow-left"
            rounded
            text
            @click="goBack"
        />
        <div>
          <h1 class="text-4xl font-bold text-gray-800">{{ hotel?.name }}</h1>
          <p class="text-gray-600 mt-1">
            <i class="pi pi-map-marker mr-2"></i>{{ hotel?.address }}
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <pv-button
          label="Add Room"
          icon="pi pi-plus"
          @click="openCreateRoomDialog"
      />
      <pv-button
          label="View Reservations"
          icon="pi pi-calendar"
          severity="secondary"
          @click="goToReservations"
      />
    </div>

    <!-- Rooms Table -->
    <pv-card class="mt-6">
      <template #title>
        <div class="flex items-center justify-between">
          <span>Rooms Management</span>
          <pv-badge :value="rooms.length" severity="info" />
        </div>
      </template>
      <template #content>
        <pv-data-table :value="rooms" striped-rows responsive-layout="scroll">
          <template #empty>
            <div class="empty-state-small">
              <i class="pi pi-inbox text-4xl text-gray-300 mb-2"></i>
              <p class="text-gray-500">No rooms added yet</p>
            </div>
          </template>

          <pv-column field="image" header="Image" style="width: 120px">
            <template #body="{ data }">
              <img
                  :src="data.image || 'https://via.placeholder.com/100'"
                  alt="Room"
                  class="room-thumbnail"
              />
            </template>
          </pv-column>

          <pv-column field="type" header="Type" sortable></pv-column>

          <pv-column field="price" header="Price/Night" sortable>
            <template #body="{ data }">
              <span class="font-semibold text-green-600">${{ data.price.toFixed(2) }}</span>
            </template>
          </pv-column>

          <pv-column field="isAvailable" header="Status">
            <template #body="{ data }">
              <pv-tag
                  :value="data.isAvailable ? 'Available' : 'Occupied'"
                  :severity="data.isAvailable ? 'success' : 'danger'"
              />
            </template>
          </pv-column>

          <pv-column header="Actions" style="width: 150px">
            <template #body="{ data }">
              <div class="table-actions">
                <pv-button
                    icon="pi pi-pencil"
                    size="small"
                    rounded
                    outlined
                    @click="openEditRoomDialog(data)"
                />
                <pv-button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    rounded
                    outlined
                    @click="deleteRoom(data.id)"
                />
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <!-- Room Dialog -->
    <pv-dialog
        v-model:visible="showRoomDialog"
        :header="editingRoom ? 'Edit Room' : 'Create New Room'"
        :style="{ width: '550px' }"
        modal
    >
      <div class="dialog-content">
        <pv-float-label variant="on" class="mb-4">
          <pv-input-text id="image" v-model="roomForm.image" class="w-full" />
          <label for="image">Image URL</label>
        </pv-float-label>

        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium text-gray-700">Room Type</label>
          <pv-select
              v-model="roomForm.type"
              :options="roomTypes"
              option-label="label"
              option-value="value"
              placeholder="Select a room type"
              class="w-full"
          />
        </div>

        <pv-float-label variant="on" class="mb-4">
          <pv-input-number
              id="price"
              v-model="roomForm.price"
              mode="currency"
              currency="USD"
              :min="0"
              class="w-full"
          />
          <label for="price">Price per Night</label>
        </pv-float-label>

        <div class="flex items-center gap-2">
          <pv-checkbox
              v-model="roomForm.isAvailable"
              :binary="true"
              input-id="available"
          />
          <label for="available" class="cursor-pointer">Room Available for Booking</label>
        </div>
      </div>

      <template #footer>
        <pv-button
            label="Cancel"
            severity="secondary"
            outlined
            @click="showRoomDialog = false"
        />
        <pv-button
            :label="editingRoom ? 'Update' : 'Create'"
            icon="pi pi-check"
            @click="saveRoom"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.hotel-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.detail-header {
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.room-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state-small {
  text-align: center;
  padding: 3rem 1rem;
}

.dialog-content {
  padding: 1rem 0;
}
</style>