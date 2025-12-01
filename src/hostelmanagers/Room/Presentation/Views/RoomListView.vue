<!-- rooms/presentation/RoomListView.vue -->
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {useRoomStore} from "../../Application/room.store.js";
import {useAuthStore} from "../../../IAM/application/auth.store.js";

const roomStore = useRoomStore();
const authStore = useAuthStore();
const route = useRoute();
const hotelId = ref(route.params.hotelId);
const showCreateDialog = ref(false);

onMounted(() => {
  roomStore.fetchRoomsByHotelId(hotelId.value);
});

const handleDelete = async (id) => {
  if (confirm("¿Está seguro de eliminar esta habitación?")) {
    await roomStore.deleteRoom(id);
  }
};
</script>

<template>
  <div class="p-4 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Habitaciones del Hotel</h1>
      <pv-button
          v-if="authStore.user?.roles === 'Admin'"
          label="Crear Habitación"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
      />
    </div>

    <pv-data-table
        :value="roomStore.rooms"
        dataKey="id"
        :loading="roomStore.loading"
        responsiveLayout="scroll"
        paginator
        :rows="10"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} habitaciones"
        :rowsPerPageOptions="[10,25,50]"
    >
      <pv-column field="type" header="Tipo">
        <template #body="slotProps">
          <span class="font-medium">{{ slotProps.data.type }}</span>
        </template>
      </pv-column>

      <pv-column header="Imagen">
        <template #body="slotProps">
          <img
              :src="slotProps.data.image"
              alt="Habitación"
              class="w-20 h-16 object-cover rounded-lg border"
          />
        </template>
      </pv-column>

      <pv-column field="price" header="Precio">
        <template #body="slotProps">
          <span class="font-bold text-green-600">${{ slotProps.data.price.toLocaleString() }} / noche</span>
        </template>
      </pv-column>

      <pv-column header="Acciones">
        <template #body="slotProps">
          <div class="flex flex-wrap gap-2">
            <pv-button
                v-if="authStore.user?.roles === 'Admin'"
                label="Editar"
                severity="info"
                size="small"
                icon="pi pi-pencil"
                @click="$router.push({ name: 'edit-room', params: { id: slotProps.data.id, hotelId: hotelId } })"
            />
            <pv-button
                v-if="authStore.user?.roles === 'Admin'"
                label="Eliminar"
                severity="danger"
                size="small"
                icon="pi pi-trash"
                @click="handleDelete(slotProps.data.id)"
            />
            <pv-button
                v-else
                label="Reservar"
                severity="success"
                size="small"
                icon="pi pi-calendar-plus"
                @click="$router.push({ name: 'create-booking', params: { roomId: slotProps.data.id, hotelId: hotelId } })"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <CreateRoomDialog
        v-if="showCreateDialog"
        :hotelId="hotelId"
        @close="showCreateDialog = false; roomStore.fetchRoomsByHotelId(hotelId)"
    />
  </div>
</template>