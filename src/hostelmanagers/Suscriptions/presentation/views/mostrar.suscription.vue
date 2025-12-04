<script setup>
import { onMounted } from "vue";
import useSuscriptionStore from "../../application/suscription.store.js";

const store = useSuscriptionStore();

onMounted(() => {
  store.fetchSuscriptions();
});

// Función auxiliar para leer el Enum de status
const getStatusLabel = (statusCode) => {
  return statusCode === 0 ? 'Suscrito' : 'No Suscrito';
};

const getPlanLabel = (planCode) => {
  const plans = { 0: 'Free', 1: 'Standard', 2: 'Premium' };
  return plans[planCode] || 'Unknown';
};
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Suscripciones</h1>

    <pv-data-table
        :value="store.suscriptions"
        dataKey="id"
        :loading="store.loading"
        responsiveLayout="scroll"
    >
      <pv-column field="id" header="ID" />

      <pv-column field="plan" header="Plan">
        <template #body="slotProps">
          {{ getPlanLabel(slotProps.data.plan) }}
        </template>
      </pv-column>

      <pv-column field="payPalTransactionId" header="Transaction ID" />

      <pv-column field="statu" header="Status">
        <template #body="slotProps">
             <span :class="{'text-green-600 font-bold': slotProps.data.statu === 0}">
                 {{ getStatusLabel(slotProps.data.statu) }}
             </span>
        </template>
      </pv-column>

    </pv-data-table>

    <div v-if="store.errors.length" class="text-red-600 mt-3">
      Error al cargar suscripciones
    </div>
  </div>
</template>