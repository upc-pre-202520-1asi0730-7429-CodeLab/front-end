<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useRoomStore from "../../application/room.store.js";

const store = useRoomStore();
const route = useRoute();
const router = useRouter();
const hotelId = route.params.hotelId;

onMounted(() => {
  store.fetchRoomsByHotelId(hotelId);
});


const onEdit = (roomId) => {
  router.push(`/hotels/${hotelId}/rooms/${roomId}/edit`);
};


const onDelete = async (roomId) => {
  if (confirm("¿Estás seguro de eliminar esta habitación?")) {
    const ok = await store.deleteRoom(roomId);
    if (ok) {

      store.fetchRoomsByHotelId(hotelId);
    } else {
      alert("Error al eliminar");
    }
  }
};
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Habitaciones del Hotel #{{hotelId}}</h1>
      <router-link :to="`/hotels/${hotelId}/rooms/create`">
        <pv-button label="Nueva Habitación" icon="pi pi-plus" />
      </router-link>
    </div>

    <pv-data-table
        :value="store.rooms"
        dataKey="id"
        :loading="store.loading"
        responsiveLayout="scroll"
    >
      <pv-column field="id" header="ID" />
      <pv-column field="imagen" header="Image" />
      <pv-column field="type" header="Type" />
      <pv-column field="price" header="Price" />

      <pv-column header="Acciones" style="min-width: 8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <pv-button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success p-button-text"
                @click="onEdit(slotProps.data.id)"
            />
            <pv-button
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-text"
                @click="onDelete(slotProps.data.id)"
            />
          </div>
        </template>
      </pv-column>

    </pv-data-table>
  </div>
</template>