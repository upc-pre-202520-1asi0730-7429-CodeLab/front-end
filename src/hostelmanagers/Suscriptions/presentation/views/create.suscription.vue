<script setup>
import { ref } from "vue";
import useSuscriptionStore from "../../application/suscription.store.js";

const store = useSuscriptionStore();

// Formulario inicial
const form = ref({
  plan: 0, // Default Free
  payPalTransactionId: "",
  statu: 1 // Default NoSuscrito (El back lo recalculará, pero el comando lo pide)
});

const error = ref("");
const success = ref("");

// Opciones para el Select del Plan (Simulando el Enum del Back)
const planOptions = [
  { label: 'Free', value: 0 },
  { label: 'Standard', value: 1 },
  { label: 'Premium', value: 2 }
];

const handleCreate = async () => {
  error.value = "";
  success.value = "";

  // Validacion simple local
  if (!form.value.payPalTransactionId) {
    error.value = "El ID de transacción es obligatorio";
    return;
  }

  const ok = await store.createSuscription(form.value);

  if (ok) {
    success.value = "Suscripción creada correctamente";
    form.value = {
      plan: 0,
      payPalTransactionId: "",
      statu: 1
    };
  } else {
    error.value = "No se pudo crear la suscripción. Verifica el ID de transacción.";
  }
};
</script>

<template>
  <div class="centered-container">
    <div class="p-4 max-w-lg mx-auto text-center">
      <h1 class="text-2xl font-semibold mb-4">Nueva Suscripción</h1>

      <form @submit.prevent="handleCreate" class="space-y-4">

        <div class="field-container">
          <label for="plan" class="block text-left mb-1 text-sm font-medium text-gray-700">Plan Type</label>
          <select
              id="plan"
              v-model="form.plan"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
          >
            <option v-for="opt in planOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <br/>

        <pv-float-label variant="on">
          <pv-input-text id="payPalTransactionId" v-model="form.payPalTransactionId" required />
          <label for="payPalTransactionId">PayPal Transaction ID</label>
        </pv-float-label>
        <br/>

        <pv-button type="submit" label="Subscribe" />
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
.field-container {
  text-align: left;
}
</style>