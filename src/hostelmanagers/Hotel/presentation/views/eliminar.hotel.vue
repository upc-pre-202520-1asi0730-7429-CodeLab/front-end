<script setup>
import { onMounted, ref } from "vue";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const error = ref("");
const success = ref("");

onMounted(() => {
  store.fetchHotels();
});

const handleDelete = async (id) => {
  error.value = "";
  success.value = "";

  const ok = await store.deleteHotel(id);
  if (ok) {
    success.value = "Hotel eliminado correctamente";
  } else {
    error.value = "No se pudo eliminar el hotel";
  }
};
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Eliminar Hotel</h1>

    <pv-data-table
        :value="store.hotels"
        dataKey="id"
        :loading="store.loading"
        responsiveLayout="scroll"
    >
      <pv-column field="id" header="ID" />
      <pv-column field="name" header="Name" />
      <pv-column field="address" header="Address" />
      <pv-column field="phone" header="Phone" />

      <pv-column header="Acciones">
        <template #body="slotProps">
          <pv-button
              label="Eliminar"
              severity="danger"
              @click="handleDelete(slotProps.data.id)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-if="success" class="text-green-600 mt-3">{{ success }}</div>
    <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
  </div>
</template>
