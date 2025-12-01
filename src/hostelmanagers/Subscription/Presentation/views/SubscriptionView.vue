<script setup>
import { ref } from 'vue';
import {useSuscriptionStore} from "../../Application/subscription.store.js";
const store = useSuscriptionStore();
const selectedPlanId = ref(null);

// Definición de los planes con sus detalles
const plans = [
  {
    id: 1,
    name: "Free",
    cost: 0,
    description: "Acceso básico a funciones limitadas. Ideal para probar la plataforma.",
    benefits: ["Acceso a contenido gratuito", "Soporte comunitario", "1 proyecto activo"],
    buttonText: "Activar Plan Free"
  },
  {
    id: 2,
    name: "Standard",
    cost: 40,
    description: "Funciones avanzadas para usuarios activos. La mejor opción para la mayoría.",
    benefits: ["Todo lo de Free", "Contenido exclusivo", "Soporte prioritario por email", "5 proyectos activos"],
    buttonText: "Suscribirse por $40/mes"
  },
  {
    id: 3,
    name: "Premium",
    cost: 60,
    description: "Acceso total y prioritario. Diseñado para profesionales y equipos.",
    benefits: ["Todo lo de Standard", "Funciones Beta exclusivas", "Soporte 24/7 por chat", "Proyectos ilimitados"],
    buttonText: "Suscribirse por $60/mes"
  }
];

/**
 * Lógica para manejar la suscripción al presionar un botón.
 * @param {Object} plan - El objeto del plan seleccionado.
 */
const handleSubscribe = async (plan) => {
  selectedPlanId.value = plan.id;

  // ⚠️ NOTA: En un caso real, la payPalTransactionId debe obtenerse
  // de un proceso de pago real (ej. al completar un checkout de PayPal).
  // Aquí usamos un valor de prueba.

  const suscriptionData = {
    plan: plan.id,
    payPalTransactionId: `TXN-${Date.now()}-${plan.id}`, // Generar un ID de transacción de prueba
    statu: 1 // Estado 1: Activa/Pagada (según la petición)
  };

  try {
    const success = await store.createSuscription(suscriptionData);

    if (success) {
      alert(`¡Suscripción al plan ${plan.name} exitosa!`);
    } else {
      // Manejar el caso de error de la API
      alert(`Error al suscribirse al plan ${plan.name}. Consulta la consola.`);
      console.error("Errores de Pinia Store:", store.errors);
    }
  } catch (error) {
    alert("Ocurrió un error inesperado al procesar la suscripción.");
    console.error(error);
  } finally {
    selectedPlanId.value = null; // Resetear el plan seleccionado
  }
};
</script>

<template>
  <div class="subscription-view">
    <header class="header">
      <h1>Elige el Plan Perfecto para Ti</h1>
      <p>Comienza hoy y accede a todas las herramientas que necesitas para triunfar.</p>
    </header>

    <div class="plans-container">
      <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['plan-card', { 'featured': plan.name === 'Standard' }]"
      >
        <div class="plan-header">
          <h2>{{ plan.name }}</h2>
          <p class="cost">
            <span class="price">${{ plan.cost }}</span>
            <span v-if="plan.cost > 0" class="period">/mes</span>
          </p>
        </div>

        <p class="description">{{ plan.description }}</p>

        <ul class="benefits">
          <li v-for="(benefit, index) in plan.benefits" :key="index">
            ✅ {{ benefit }}
          </li>
        </ul>

        <button
            @click="handleSubscribe(plan)"
            :disabled="store.loading && selectedPlanId === plan.id"
            class="subscribe-button"
        >
          <span v-if="store.loading && selectedPlanId === plan.id">Procesando...</span>
          <span v-else>{{ plan.buttonText }}</span>
        </button>
      </div>
    </div>

    <div v-if="store.errors.length" class="error-message">
      <h3>🚨 Error al intentar suscribirse:</h3>
      <ul>
        <li v-for="(err, index) in store.errors" :key="index">{{ err.message || 'Error desconocido' }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* --- Estilos del Componente --- */

.subscription-view {
  font-family: Arial, sans-serif;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.1rem;
  color: #666;
}

.plans-container {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.plan-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.featured {
  border-color: #007bff;
  box-shadow: 0 0 0 3px #007bff50, 0 8px 25px rgba(0, 0, 0, 0.15);
}

.plan-header {
  margin-bottom: 20px;
  text-align: center;
}

.plan-header h2 {
  font-size: 1.8rem;
  color: #007bff;
  margin-bottom: 10px;
}

.featured h2 {
  color: #ffc107; /* Color de acento para el destacado */
}

.cost {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

.price {
  margin-right: 5px;
}

.period {
  font-size: 1rem;
  font-weight: normal;
  color: #888;
}

.description {
  font-size: 1rem;
  color: #777;
  margin-bottom: 25px;
  text-align: center;
  min-height: 40px; /* Para alinear un poco mejor si las descripciones varían */
}

.benefits {
  list-style: none;
  padding: 0;
  margin-bottom: auto; /* Empuja el botón hacia abajo */
  flex-grow: 1;
}

.benefits li {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.5;
}

.subscribe-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
  margin-top: 30px;
  width: 100%;
}

.subscribe-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.subscribe-button:disabled {
  background-color: #a0c3e8;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  margin-top: 40px;
  padding: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  border-radius: 8px;
}

.error-message h3 {
  margin-top: 0;
}
</style>