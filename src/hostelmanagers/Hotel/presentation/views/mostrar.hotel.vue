<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const router = useRouter();

onMounted(() => {
  store.fetchHotels();
});


const onViewRooms = (hotelId) => {
  // Navega a la ruta: /hotels/ID/rooms
  router.push(`/hotels/${hotelId}/rooms`);
};
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Hoteles (Gestión)</h1>

    <pv-data-table
        :value="store.hotels"
        dataKey="id"
        :loading="store.loading"
        responsiveLayout="scroll"
    >
      <pv-column field="id" header="ID" />
      <pv-column field="name" header="Name" />
      <pv-column field="images" header="Image" />
      <pv-column field="address" header="Address" />
      <pv-column field="phone" header="Phone" />
      <pv-column field="userId" header="User Id" />

      <pv-column header="Acciones">
        <template #body="slotProps">
          <pv-button
              icon="pi pi-key"
              label="Ver Rooms"
              class="p-button-sm p-button-info"
              @click="onViewRooms(slotProps.data.id)"
          />
        </template>
      </pv-column>

    </pv-data-table>

    <div v-if="store.errors.length" class="text-red-600 mt-3">
      Error al cargar hoteles
    </div>
  </div>
</template>