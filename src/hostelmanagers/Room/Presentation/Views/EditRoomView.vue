<!-- rooms/presentation/EditRoomView.vue -->
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {useAuthStore} from "../../../IAM/application/auth.store.js";
import {useRoomStore} from "../../Application/room.store.js";

const roomStore = useRoomStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const roomId = ref(route.params.id);
const hotelId = ref(route.params.hotelId);

const form = ref({
  id: null,
  image: "",
  type: "",
  price: 0,
  hotelId: hotelId.value
});

const error = ref("");
const success = ref("");

onMounted(async () => {
  if (authStore.user?.roles !== 'Admin') {
    router.push({ name: 'home' });
    return;
  }

  await roomStore.fetchRoomById(roomId.value);
  if (roomStore.currentRoom) {
    form.value = { ...roomStore.currentRoom };
  } else {
    error.value = "Habitación no encontrada";
  }
});

const handleUpdate = async () => {
  error.value = "";
  success.value = "";

  const ok = await roomStore.updateRoom(form.value.id, form.value);
  if (ok) {
    success.value = "Habitación actualizada correctamente";
    setTimeout(() => router.push({ name: 'hotel-rooms', params: { hotelId: hotelId.value } }), 1500);
  } else {
    error.value = "Error al actualizar la habitación";
  }
};

const goBack = () => router.push({ name: 'hotel-rooms', params: { hotelId: hotelId.value } });
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div class="flex items-center mb-6">
      <pv-button
          icon="pi pi-arrow-left"
          severity="secondary"
          rounded
          @click="goBack"
          class="mr-3"
      />
      <h1 class="text-2xl font-bold text-gray-800">Editar Habitación</h1>
    </div>

    <pv-card>
      <form @submit.prevent="handleUpdate" class="space-y-6">
        <pv-float-label variant="on">
          <pv-input-text id="type" v-model="form.type" required class="w-full" />
          <label for="type">Tipo de Habitación</label>
        </pv-float-label>

        <pv-float-label variant="on">
          <pv-input-text id="image" v-model="form.image" required class="w-full" />
          <label for="image">URL de la Imagen</label>
        </pv-float-label>

        <pv-float-label variant="on">
          <pv-input-number
              id="price"
              v-model="form.price"
              mode="currency"
              currency="USD"
              locale="es-US"
              :min="0"
              required
              class="w-full"
          />
          <label for="price">Precio por Noche</label>
        </pv-float-label>

        <div class="flex justify-end gap-3 mt-4 pt-4 border-t">
          <pv-button type="button" label="Cancelar" severity="secondary" @click="goBack" />
          <pv-button type="submit" label="Actualizar Habitación" icon="pi pi-save" />
        </div>
      </form>

      <div v-if="success" class="mt-4 text-green-600 font-medium">{{ success }}</div>
      <div v-if="error" class="mt-4 text-red-600 font-medium">{{ error }}</div>
    </pv-card>
  </div>
</template>