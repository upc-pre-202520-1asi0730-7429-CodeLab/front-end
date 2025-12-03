<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import useRoomStore from "../../application/room.store.js";

const store = useRoomStore();
const route = useRoute();
const hotelId = route.params.hotelId;

onMounted(() => {

  store.fetchRoomsByHotelId(hotelId);
});
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
    </pv-data-table>

    <div v-if="store.rooms.length === 0 && !store.loading" class="text-gray-500 mt-4">
      No hay habitaciones registradas para este hotel.
    </div>
  </div>
</template>