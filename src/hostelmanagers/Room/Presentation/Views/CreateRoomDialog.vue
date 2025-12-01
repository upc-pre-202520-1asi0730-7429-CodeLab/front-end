<!-- rooms/presentation/CreateRoomDialog.vue -->
<script setup>
import { ref } from "vue";
import {useRoomStore} from "../../Application/room.store.js";

const props = defineProps({
  hotelId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close']);
const roomStore = useRoomStore();

const form = ref({
  image: "",
  type: "",
  price: 0,
  hotelId: props.hotelId
});

const error = ref("");
const success = ref("");

const handleCreate = async () => {
  error.value = "";
  success.value = "";

  const ok = await roomStore.createRoom(form.value);
  if (ok) {
    success.value = "Habitación creada correctamente";
    setTimeout(() => {
      emit('close');
      form.value = { image: "", type: "", price: 0, hotelId: props.hotelId };
    }, 1500);
  } else {
    error.value = "Error al crear la habitación";
  }
};
</script>

<template>
  <pv-dialog
      v-model:visible="visible"
      header="Crear Nueva Habitación"
      :modal="true"
      :style="{ width: '500px' }"
      @update:visible="emit('close')"
  >
    <form @submit.prevent="handleCreate" class="space-y-4">
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

      <div class="flex justify-between mt-4">
        <pv-button type="button" label="Cancelar" severity="secondary" @click="emit('close')" />
        <pv-button type="submit" label="Crear Habitación" icon="pi pi-check" />
      </div>
    </form>

    <div v-if="success" class="mt-3 text-green-600 font-medium">{{ success }}</div>
    <div v-if="error" class="mt-3 text-red-600 font-medium">{{ error }}</div>
  </pv-dialog>
</template>