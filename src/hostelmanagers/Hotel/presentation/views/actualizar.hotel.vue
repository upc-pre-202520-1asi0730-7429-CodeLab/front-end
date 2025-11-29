<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const route = useRoute();
const router = useRouter();

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
  const id = Number(route.params.id);
  await store.fetchHotelById(id);
  if (store.currentHotel) {
    form.value = { ...store.currentHotel };
  } else {
    error.value = "Hotel no encontrado";
  }
});

const handleUpdate = async () => {
  error.value = "";
  success.value = "";

  const ok = await store.updateHotel(form.value.id, {
    name: form.value.name,
    images: form.value.images,
    address: form.value.address,
    phone: form.value.phone,
    userId: form.value.userId
  });

  if (ok) {
    success.value = "Hotel actualizado correctamente";
  } else {
    error.value = "No se pudo actualizar el hotel";
  }
};

const goBack = () => router.push({ name: "hotel-list" });
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Actualizar Hotel</h1>

    <form @submit.prevent="handleUpdate" class="space-y-4">
      <pv-float-label variant="on">
        <pv-input-text id="name" v-model="form.name" required />
        <label for="name">Name</label>
      </pv-float-label>

      <pv-float-label variant="on">
        <pv-input-text id="images" v-model="form.images" required />
        <label for="images">Image path / URL</label>
      </pv-float-label>

      <pv-float-label variant="on">
        <pv-input-text id="address" v-model="form.address" required />
        <label for="address">Address</label>
      </pv-float-label>

      <pv-float-label variant="on">
        <pv-input-text id="phone" v-model="form.phone" required />
        <label for="phone">Phone</label>
      </pv-float-label>

      <pv-float-label variant="on">
        <pv-input-number id="userId" v-model="form.userId" :min="0" required />
        <label for="userId">User Id</label>
      </pv-float-label>

      <div class="flex items-center gap-2 mt-2">
        <pv-button type="submit" label="Update" />
        <pv-button type="button" label="Back" severity="help" @click="goBack" />
      </div>
    </form>

    <div v-if="success" class="text-green-600 mt-3">{{ success }}</div>
    <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
  </div>
</template>
