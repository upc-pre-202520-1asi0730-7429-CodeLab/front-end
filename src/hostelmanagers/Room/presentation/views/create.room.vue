<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useRoomStore from "../../application/room.store.js";

const store = useRoomStore();
const route = useRoute();
const router = useRouter();


const hotelIdParam = route.params.hotelId;

const form = ref({
  imagen: "",
  type: "",
  price: 0,
  hotelId: Number(hotelIdParam)
});

const error = ref("");
const success = ref("");

const handleCreate = async () => {
  error.value = "";
  success.value = "";

  const ok = await store.createRoom(form.value);
  if (ok) {
    success.value = "Habitación creada correctamente";

    setTimeout(() => {
      router.push(`/hotels/${hotelIdParam}/rooms`);
    }, 1500);
  } else {
    error.value = "No se pudo crear la habitación";
  }
};
</script>

<template>
  <div class="centered-container">
    <div class="p-4 max-w-lg mx-auto text-center">
      <h1 class="text-2xl font-semibold mb-4">Crear Habitación (Hotel #{{hotelIdParam}})</h1>

      <form @submit.prevent="handleCreate" class="space-y-4">

        <pv-float-label variant="on">
          <pv-input-text id="imagen" v-model="form.imagen" required />
          <label for="imagen">Image URL</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text id="type" v-model="form.type" required />
          <label for="type">Type (Single, Double...)</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-number id="price" v-model="form.price" :min="1" required />
          <label for="price">Price</label>
        </pv-float-label> <br/>

        <pv-button type="submit" label="Create Room" />
      </form>

      <div v-if="success" class="text-green-600 mt-3">{{ success }}</div>
      <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
.centered-container {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f7f7f7;
}
</style>