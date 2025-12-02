<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useSuscriptionStore } from "../../Application/subscription.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";

const store = useSuscriptionStore();
const authStore = useAuthStore();
const selectedPlanId = ref(null);

// PROPIEDAD COMPUTADA: Asegura que el ID del usuario sea reactivo.
const authenticatedUserId = computed(() => authStore.currentUser?.id || authStore.userId || null);

// Definición de los planes
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
    description: "Acciones total y prioritario. Diseñado para profesionales y equipos.",
    benefits: ["Todo lo de Standard", "Funciones Beta exclusivas", "Soporte 24/7 por chat", "Proyectos ilimitados"],
    buttonText: "Suscribirse por $60/mes"
  }
];

// --- Lógica de Manejo de la Suscripción Gratuita (Sin PayPal) ---

const handleFreeSubscription = async (plan) => {
  const userId = authenticatedUserId.value;

  if (!userId) {
    console.error("🚫 Error de autenticación: El ID del usuario es nulo o indefinido.");
    alert("Error: El ID del usuario no está disponible. Por favor, inicie sesión nuevamente.");
    return;
  }

  selectedPlanId.value = plan.id;

  const suscriptionData = {
    userId: String(userId), // 👈 CORRECCIÓN A STRING
    plan: plan.id,
    payPalTransactionId: `FREE-${Date.now()}`,
    statu: 1
  };

  console.log("🚀 PAYLOAD PLAN FREE ENVIADO:", suscriptionData);

  try {
    const success = await store.createSuscription(suscriptionData);

    if (success) {
      alert(`¡Suscripción al plan ${plan.name} activada!`);
    } else {
      alert(`Error al activar el plan Free. Consulta la consola.`);
    }
  } catch (error) {
    alert("Ocurrió un error inesperado.");
  } finally {
    selectedPlanId.value = null;
  }
};


// --- Lógica de Integración de PayPal ---

const renderPayPalButton = (plan) => {
  if (plan.cost <= 0 || !window.paypal || typeof window.paypal.Buttons !== 'function') return;

  const userId = authenticatedUserId.value;

  if (!userId) {
    return;
  }

  const containerId = `paypal-button-container-${plan.id}`;
  const buttonContainer = document.getElementById(containerId);

  // Evita renderizar dos veces
  if (buttonContainer && buttonContainer.querySelector('iframe')) {
    return;
  }

  if (buttonContainer) {
    buttonContainer.innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        selectedPlanId.value = plan.id;
        return actions.order.create({
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: plan.cost.toFixed(2)
            }
          }]
        });
      },

      onApprove: async (data, actions) => {
        const details = await actions.order.capture();

        if (details.status === 'COMPLETED') {
          const payPalTransactionId = details.id;
          const userId = authenticatedUserId.value;

          if (!userId) {
            console.error("🚫 Error de autenticación: User ID no disponible después de la aprobación de PayPal.");
            alert("Pago aprobado, pero ID de usuario perdido. Contacte soporte con ID de transacción: " + payPalTransactionId);
            return;
          }

          const suscriptionData = {
            userId: String(userId), // 👈 CORRECCIÓN A STRING
            plan: plan.id,
            payPalTransactionId: payPalTransactionId,
            statu: 1
          };

          console.log("💸 PAYLOAD PLAN PAGO ENVIADO:", suscriptionData);

          try {
            const success = await store.createSuscription(suscriptionData);
            if (success) {
              alert(`¡Pago y Suscripción al plan ${plan.name} exitosa!`);
            } else {
              alert(`🚨 ERROR: Pago de PayPal exitoso, pero falló el registro de la suscripción. Consulte la consola.`);
            }
          } catch (error) {
            alert("Ocurrió un error al registrar la suscripción.");
          }
        } else {
          alert('El pago de PayPal no se completó (estado: ' + details.status + ').');
        }
        selectedPlanId.value = null;
      },
      onCancel: () => {
        selectedPlanId.value = null;
      },
      onError: (err) => {
        console.error('Error general de PayPal:', err);
        alert('Ocurrió un error con el proceso de pago. Intente nuevamente.');
        selectedPlanId.value = null;
      }
    }).render(`#${containerId}`);
  }
};

const attemptRenderPayPalButtons = () => {
  if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
    return false;
  }

  if (!authenticatedUserId.value) {
    return false;
  }

  plans.filter(p => p.cost > 0).forEach(renderPayPalButton);
  return true;
};


// --- Ciclo de Vida y Observación ---

let paypalCheckInterval = null;

onMounted(() => {
  if (attemptRenderPayPalButtons()) {
    return;
  }

  if (!paypalCheckInterval) {
    paypalCheckInterval = setInterval(() => {
      if (attemptRenderPayPalButtons()) {
        clearInterval(paypalCheckInterval);
        paypalCheckInterval = null;
      }
    }, 300);
  }
});

watch(authenticatedUserId, (newUserId) => {
  if (newUserId) {
    console.log(`[AUTH] ID de usuario cargado: ${newUserId}. Intentando renderizar PayPal.`);
    if (attemptRenderPayPalButtons() && paypalCheckInterval) {
      clearInterval(paypalCheckInterval);
      paypalCheckInterval = null;
    }
  }
});

onUnmounted(() => {
  if (paypalCheckInterval) {
    clearInterval(paypalCheckInterval);
  }
});
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

        <template v-if="plan.cost === 0">
          <button
              @click="handleFreeSubscription(plan)"
              :disabled="store.loading && selectedPlanId === plan.id || !authenticatedUserId"
              class="subscribe-button"
          >
            <span v-if="!authenticatedUserId">Iniciar sesión para activar</span>
            <span v-else-if="store.loading && selectedPlanId === plan.id">Procesando...</span>
            <span v-else>{{ plan.buttonText }}</span>
          </button>
        </template>

        <template v-else>
          <div
              :id="`paypal-button-container-${plan.id}`"
              :style="{ minHeight: '50px' }"
              class="paypal-button-wrapper"
          >
            <div
                v-show="store.loading && selectedPlanId === plan.id"
                class="paypal-loading-overlay"
            >
              Procesando Pago...
            </div>

            <div
                v-show="!authenticatedUserId && !store.loading && !attemptRenderPayPalButtons()"
                class="paypal-loading-overlay"
                style="background: #e3f2fd; color: #1976d2;"
            >
              Por favor, inicia sesión para suscribirte.
            </div>

          </div>
        </template>

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
/* --- Estilos (Mantenidos) --- */

.subscription-view {
  font-family: Arial, sans-serif;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.paypal-button-wrapper {
  margin-top: 30px;
  min-height: 50px;
  position: relative;
}

.paypal-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #007bff;
  border-radius: 8px;
  z-index: 10;
  padding: 10px;
  text-align: center;
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
  color: #ffc107;
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
  min-height: 40px;
}

.benefits {
  list-style: none;
  padding: 0;
  margin-bottom: auto;
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