<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const route = useRoute();
const router = useRouter();

// Obtenemos el ID de la URL
const hotelId = route.params.id;

const form = ref({
  id: null,
  name: "",
  images: "",
  address: "",
  phone: "",
  userId: 0
});

const error = ref("");
const success = ref("");

onMounted(async () => {
  // Cargar datos actuales del hotel
  await store.fetchHotelById(hotelId);

  if (store.currentHotel) {
    // Rellenar formulario
    form.value = { ...store.currentHotel };
  } else {
    error.value = "No se encontró el hotel o no existe.";
  }
});

const handleUpdate = async () => {
  error.value = "";
  success.value = "";

  const ok = await store.updateHotel(hotelId, form.value);

  if (ok) {
    success.value = "Hotel actualizado correctamente.";
    // Regresar a la lista tras 1 segundo
    setTimeout(() => {
      router.push("/hotels");
    }, 1000);
  } else {
    error.value = "Error al actualizar el hotel. Verifica los datos.";
  }
};

const goBack = () => router.push("/hotels");
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <div class="card bg-white shadow-md rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Editar Hotel</h1>

      <form @submit.prevent="handleUpdate" class="space-y-5">

        <div class="flex flex-col gap-1">
          <label for="name" class="font-semibold text-gray-600">Nombre del Hotel</label>
          <pv-input-text id="name" v-model="form.name" required class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="images" class="font-semibold text-gray-600">URL de Imagen</label>
          <pv-input-text id="images" v-model="form.images" required class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="address" class="font-semibold text-gray-600">Dirección</label>
          <pv-input-text id="address" v-model="form.address" required class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="phone" class="font-semibold text-gray-600">Teléfono</label>
          <pv-input-text id="phone" v-model="form.phone" required class="w-full" />
        </div>

        <div class="flex items-center gap-3 pt-4">
          <pv-button type="submit" label="Guardar Cambios" icon="pi pi-check" />
          <pv-button type="button" label="Cancelar" severity="secondary" icon="pi pi-times" @click="goBack" />
        </div>
      </form>

      <div v-if="success" class="text-green-600 mt-4 font-medium flex items-center gap-2">
        <i class="pi pi-check-circle"></i> {{ success }}
      </div>
      <div v-if="error" class="text-red-600 mt-4 font-medium flex items-center gap-2">
        <i class="pi pi-exclamation-circle"></i> {{ error }}
      </div>
    </div>
  </div>
</template>