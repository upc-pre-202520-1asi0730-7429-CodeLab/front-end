<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useRoomStore from "../../application/room.store.js";

const store = useRoomStore();
const route = useRoute();
const router = useRouter();

// Capturamos IDs de la URL
const hotelId = route.params.hotelId;
const roomId = route.params.id;

const form = ref({
  id: null,
  imagen: "",
  type: "",
  price: 0,
  hotelId: Number(hotelId)
});

const error = ref("");
const success = ref("");

// Al cargar la página, pedimos los datos de la habitación
onMounted(async () => {
  await store.fetchRoomById(roomId);
  if (store.currentRoom) {
    // Llenamos el formulario con lo que vino del backend
    form.value = { ...store.currentRoom };
  } else {
    error.value = "Habitación no encontrada";
  }
});

const handleUpdate = async () => {
  error.value = "";
  success.value = "";

  const ok = await store.updateRoom(roomId, form.value);

  if (ok) {
    success.value = "Habitación actualizada correctamente";
    // Volvemos a la lista después de 1 segundo
    setTimeout(() => {
      router.push(`/hotels/${hotelId}/rooms`);
    }, 1000);
  } else {
    error.value = "No se pudo actualizar la habitación";
  }
};

const goBack = () => router.push(`/hotels/${hotelId}/rooms`);
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Editar Habitación #{{roomId}}</h1>

    <form @submit.prevent="handleUpdate" class="space-y-4">

      <pv-float-label variant="on">
        <pv-input-text id="imagen" v-model="form.imagen" required />
        <label for="imagen">Image URL</label>
      </pv-float-label> <br/>

      <pv-float-label variant="on">
        <pv-input-text id="type" v-model="form.type" required />
        <label for="type">Type</label>
      </pv-float-label> <br/>

      <pv-float-label variant="on">
        <pv-input-number id="price" v-model="form.price" :min="1" required />
        <label for="price">Price</label>
      </pv-float-label> <br/>

      <div class="flex items-center gap-2 mt-2">
        <pv-button type="submit" label="Guardar Cambios" />
        <pv-button type="button" label="Cancelar" severity="secondary" @click="goBack" />
      </div>

    </form>

    <div v-if="success" class="text-green-600 mt-3">{{ success }}</div>
    <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
  </div>
</template>