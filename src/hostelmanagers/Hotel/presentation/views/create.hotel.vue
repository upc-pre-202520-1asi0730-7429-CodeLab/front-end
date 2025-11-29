<script setup>
import { ref, onMounted } from "vue";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();

const form = ref({
  name: "",
  images: "",
  address: "",
  phone: "",
  userId: 0
});

const error = ref("");
const success = ref("");

onMounted(() => {
  const raw = localStorage.getItem("currentUser");
  if (raw) {
    try {
      const currentUser = JSON.parse(raw);
      if (currentUser && currentUser.id) {
        form.value.userId = currentUser.id; // ⚡ se asigna solo
      }
    } catch {
      // si falla el parse, deja userId en 0 o maneja error
    }
  }
});

const handleCreate = async () => {
  error.value = "";
  success.value = "";

  const ok = await store.createHotel(form.value);
  if (ok) {
    success.value = "Hotel creado correctamente";
    form.value = {
      name: "",
      images: "",
      address: "",
      phone: "",
      userId: form.value.userId // seguimos usando el mismo userId
    };
  } else {
    error.value = "No se pudo crear el hotel";
  }
};
</script>

<template>
  <div class="centered-container">
    <div class="p-4 max-w-lg mx-auto text-center">
      <h1 class="text-2xl font-semibold mb-4">Crear Hotel</h1>
      <form @submit.prevent="handleCreate" class="space-y-4">
        <pv-float-label variant="on">
          <pv-input-text id="name" v-model="form.name" required />
          <label for="name">Name</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text id="images" v-model="form.images" required />
          <label for="images">Image path / URL</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text id="address" v-model="form.address" required />
          <label for="address">Address</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text id="phone" v-model="form.phone" required />
          <label for="phone">Phone</label>
        </pv-float-label> <br/>

        <pv-button type="submit" label="Create" />
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
