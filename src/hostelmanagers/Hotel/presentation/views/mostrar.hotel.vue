<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const router = useRouter();

onMounted(() => {
  store.fetchHotels();
});

// Navegar a las habitaciones
const onViewRooms = (hotelId) => {
  router.push(`/hotels/${hotelId}/rooms`);
};

// Navegar a editar hotel
const onEditHotel = (hotelId) => {
  router.push(`/hotels/${hotelId}/edit`);
};

// Lógica para eliminar hotel directamente
const onDeleteHotel = async (hotelId) => {
  if (confirm("¿Estás seguro de que quieres eliminar este hotel? Se borrarán también sus habitaciones.")) {
    const success = await store.deleteHotel(hotelId);
    if (success) {
      alert("Hotel eliminado correctamente");
    } else {
      alert("Error al eliminar el hotel");
    }
  }
};
</script>

<template>
  <div class="p-4 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Gestión de Hoteles</h1>
      <router-link to="/hotels/create">
        <pv-button label="Nuevo Hotel" icon="pi pi-plus" />
      </router-link>
    </div>

    <pv-data-table
        :value="store.hotels"
        dataKey="id"
        :loading="store.loading"
        responsiveLayout="scroll"
        paginator :rows="5"
    >
      <pv-column field="id" header="ID" sortable style="width: 3rem" />
      <pv-column field="name" header="Nombre" sortable />
      <pv-column field="address" header="Dirección" />
      <pv-column field="phone" header="Teléfono" />
      <pv-column field="userId" header="Admin ID" />

      <pv-column header="Imagen">
        <template #body="slotProps">
          <img :src="slotProps.data.images" alt="hotel" class="w-16 h-10 object-cover rounded shadow-sm" />
        </template>
      </pv-column>

      <pv-column header="Acciones" style="min-width: 12rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <pv-button
                icon="pi pi-key"
                v-tooltip.top="'Ver Habitaciones'"
                class="p-button-rounded p-button-info p-button-outlined"
                @click="onViewRooms(slotProps.data.id)"
            />

            <pv-button
                icon="pi pi-pencil"
                v-tooltip.top="'Editar Hotel'"
                class="p-button-rounded p-button-success p-button-outlined"
                @click="onEditHotel(slotProps.data.id)"
            />

            <pv-button
                icon="pi pi-trash"
                v-tooltip.top="'Eliminar Hotel'"
                class="p-button-rounded p-button-danger p-button-outlined"
                @click="onDeleteHotel(slotProps.data.id)"
            />
          </div>
        </template>
      </pv-column>

    </pv-data-table>

    <div v-if="store.errors.length" class="text-red-600 mt-3">
      Error al cargar hoteles: {{ store.errors }}
    </div>
  </div>
</template>