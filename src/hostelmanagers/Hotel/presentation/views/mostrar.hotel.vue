<script setup>
import { onMounted } from "vue";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();

onMounted(() => {
  store.fetchHotels();
});
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Hoteles</h1>

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
    </pv-data-table>

    <div v-if="store.errors.length" class="text-red-600 mt-3">
      Error al cargar hoteles
    </div>
  </div>
</template>
