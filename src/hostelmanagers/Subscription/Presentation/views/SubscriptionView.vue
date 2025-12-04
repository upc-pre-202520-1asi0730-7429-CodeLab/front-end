<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useSuscriptionStore } from "../../Application/subscription.store.js";
import useAuthStore from "../../../IAM/application/user.store.js";

const store = useSuscriptionStore();
const authStore = useAuthStore();
const selectedPlanId = ref(null);

const authenticatedUserId = computed(() => authStore.currentUser?.id || authStore.userId || null);

const plans = [
  {
    id: 1,
    name: "Free",
    cost: 0,
    description: "Acceso básico a funciones limitadas. Ideal para probar la plataforma.",
    benefits: ["Acceso a contenido gratuito", "Soporte comunitario", "1 proyecto activo"],
    buttonText: "Activar Plan Free",
    icon: "pi-gift",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
  },
  {
    id: 2,
    name: "Standard",
    cost: 40,
    description: "Funciones avanzadas para usuarios activos. La mejor opción para la mayoría.",
    benefits: ["Todo lo de Free", "Contenido exclusivo", "Soporte prioritario por email", "5 proyectos activos"],
    buttonText: "Suscribirse por $40/mes",
    icon: "pi-star",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    popular: true
  },
  {
    id: 3,
    name: "Premium",
    cost: 60,
    description: "Acciones total y prioritario. Diseñado para profesionales y equipos.",
    benefits: ["Todo lo de Standard", "Funciones Beta exclusivas", "Soporte 24/7 por chat", "Proyectos ilimitados"],
    buttonText: "Suscribirse por $60/mes",
    icon: "pi-crown",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  }
];

const handleFreeSubscription = async (plan) => {
  const userId = authenticatedUserId.value;

  if (!userId) {
    console.error("🚫 Error de autenticación: El ID del usuario es nulo o indefinido.");
    alert("Error: El ID del usuario no está disponible. Por favor, inicie sesión nuevamente.");
    return;
  }

  selectedPlanId.value = plan.id;

  const suscriptionData = {
    userId: String(userId),
    plan: plan.id,
    payPalTransactionId: `FREE-${Date.now()}`,
    statu: 1
  };

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

const renderPayPalButton = (plan) => {
  if (plan.cost <= 0 || !window.paypal || typeof window.paypal.Buttons !== 'function') return;

  const userId = authenticatedUserId.value;

  if (!userId) {
    return;
  }

  const containerId = `paypal-button-container-${plan.id}`;
  const buttonContainer = document.getElementById(containerId);

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
            userId: String(userId),
            plan: plan.id,
            payPalTransactionId: payPalTransactionId,
            statu: 1
          };

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
  <div class="subscription-container">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-sparkles"></i>
        </div>
        <h1 class="hero-title">Elige tu Plan Perfecto</h1>
        <p class="hero-subtitle">Transforma tu experiencia hotelera con nuestros planes diseñados para ti</p>
      </div>
    </div>

    <div class="plans-wrapper">
      <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['plan-card', { 'plan-popular': plan.popular }]"
      >
        <div v-if="plan.popular" class="popular-badge">
          <i class="pi pi-star-fill"></i>
          <span>Más Popular</span>
        </div>

        <div class="plan-header" :style="{ background: plan.gradient }">
          <div class="plan-icon">
            <i :class="['pi', plan.icon]"></i>
          </div>
          <h2 class="plan-name">{{ plan.name }}</h2>
        </div>

        <div class="plan-body">
          <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">{{ plan.cost }}</span>
            <span v-if="plan.cost > 0" class="period">/mes</span>
            <span v-else class="period">Gratis</span>
          </div>

          <p class="plan-description">{{ plan.description }}</p>

          <div class="benefits-section">
            <h3 class="benefits-title">
              <i class="pi pi-check-circle"></i>
              Incluye:
            </h3>
            <ul class="benefits-list">
              <li v-for="(benefit, index) in plan.benefits" :key="index" class="benefit-item">
                <i class="pi pi-check"></i>
                <span>{{ benefit }}</span>
              </li>
            </ul>
          </div>

          <div class="plan-action">
            <template v-if="plan.cost === 0">
              <button
                  @click="handleFreeSubscription(plan)"
                  :disabled="store.loading && selectedPlanId === plan.id || !authenticatedUserId"
                  class="action-button free-button"
              >
                <i v-if="store.loading && selectedPlanId === plan.id" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-gift"></i>
                <span v-if="!authenticatedUserId">Iniciar sesión</span>
                <span v-else-if="store.loading && selectedPlanId === plan.id">Procesando...</span>
                <span v-else>{{ plan.buttonText }}</span>
              </button>
            </template>

            <template v-else>
              <div
                  :id="`paypal-button-container-${plan.id}`"
                  class="paypal-container"
              >
                <div
                    v-show="store.loading && selectedPlanId === plan.id"
                    class="paypal-overlay loading"
                >
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Procesando Pago...</span>
                </div>

                <div
                    v-show="!authenticatedUserId && !store.loading"
                    class="paypal-overlay auth-required"
                >
                  <i class="pi pi-lock"></i>
                  <span>Inicia sesión para suscribirte</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.errors.length" class="error-section">
      <div class="error-card">
        <i class="pi pi-exclamation-triangle"></i>
        <h3>Error al procesar suscripción</h3>
        <ul>
          <li v-for="(err, index) in store.errors" :key="index">
            {{ err.message || 'Error desconocido' }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.subscription-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.hero-icon i {
  font-size: 3.5rem;
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 300;
}

.plans-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.plan-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  animation: scaleIn 0.5s ease-out;
  position: relative;
}

.plan-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.plan-popular {
  border: 3px solid #fbbf24;
}

.popular-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  z-index: 10;
}

.plan-header {
  padding: 3rem 2rem 2rem;
  text-align: center;
  color: white;
  position: relative;
}

.plan-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.plan-icon i {
  font-size: 2.5rem;
}

.plan-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.plan-body {
  padding: 2rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
}

.currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0369a1;
}

.amount {
  font-size: 3.5rem;
  font-weight: 800;
  color: #0c4a6e;
}

.period {
  font-size: 1.125rem;
  color: #64748b;
  font-weight: 600;
}

.plan-description {
  font-size: 1rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.benefits-section {
  margin-bottom: 2rem;
}

.benefits-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.benefits-title i {
  color: #10b981;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-item i {
  color: #10b981;
  font-size: 1.125rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.benefit-item span {
  color: #475569;
  line-height: 1.5;
}

.plan-action {
  margin-top: 2rem;
}

.action-button {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 14px;
  font-size: 1.125rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.free-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.free-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
}

.free-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.paypal-container {
  min-height: 50px;
  position: relative;
  border-radius: 14px;
  overflow: hidden;
}

.paypal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 700;
  border-radius: 14px;
  z-index: 10;
}

.paypal-overlay.loading {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.paypal-overlay.auth-required {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.paypal-overlay i {
  font-size: 1.5rem;
}

.error-section {
  max-width: 600px;
  margin: 3rem auto 0;
  animation: fadeInUp 0.5s ease-out;
}

.error-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #ef4444;
}

.error-card i {
  font-size: 3rem;
  color: #dc2626;
  display: block;
  text-align: center;
  margin-bottom: 1rem;
}

.error-card h3 {
  text-align: center;
  color: #991b1b;
  margin: 0 0 1rem;
}

.error-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-card li {
  padding: 0.5rem 0;
  color: #dc2626;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .plans-wrapper {
    grid-template-columns: 1fr;
  }

  .amount {
    font-size: 2.5rem;
  }
}
</style>