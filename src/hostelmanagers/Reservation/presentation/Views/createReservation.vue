<script setup>
import {ref, onMounted, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useToast} from 'primevue/usetoast';
import useUserStore from "../../../IAM/application/user.store.js";
import {useReservationStore} from "../../application/reservation.store.js";

defineOptions({
  name: 'CreateReservation'
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const reservationStore = useReservationStore();
const userStore = useUserStore();

const loading = ref(false);

const reservationData = ref({
  userId: userStore.currentUser?.id || null,
  roomId: route.params.id || null,
  checkInDate: new Date(),
  checkOutDate: null,
});

const minCheckOutDate = computed(() => {
  const minDate = new Date(reservationData.value.checkInDate);
  minDate.setDate(minDate.getDate() + 1);
  return minDate;
});

const isFormValid = computed(() => {
  return (
      !!reservationData.value.userId &&
      !!reservationData.value.roomId &&
      !!reservationData.value.checkOutDate &&
      reservationData.value.checkOutDate > reservationData.value.checkInDate
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Datos Incompletos',
      detail: 'Debe seleccionar una fecha de Salida válida y posterior a la Llegada.',
      life: 4000
    });
    return;
  }

  const payload = {
    userId: String(reservationData.value.userId),
    roomId: reservationData.value.roomId,
    checkInDate: reservationData.value.checkInDate.toISOString(),
    checkOutDate: reservationData.value.checkOutDate.toISOString(),
  };

  console.log("--- Diagnóstico Payload de Reserva ---");
  console.log("🚀 Payload Enviado:", payload);
  console.log("Tipo de roomId (Debe ser number):", typeof payload.roomId, "Valor:", payload.roomId);
  console.log("Tipo de userId (Debe ser string):", typeof payload.userId, "Valor:", payload.userId);
  console.log("--------------------------------------");

  loading.value = true;

  try {
    const success = await reservationStore.createReservation(payload);

    if (success) {
      toast.add({
        severity: 'success',
        summary: 'Reserva Creada',
        detail: '¡Tu reserva ha sido registrada con éxito!',
        life: 3000
      });
      router.push({name: 'ReservationView'});
    } else {
      throw new Error("Fallo al contactar al servidor o error interno.");
    }

  } catch (error) {
    console.error("Error al crear la reserva:", error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: reservationStore.errors[0]?.message || 'No se pudo crear la reserva. Intente de nuevo.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  if (!reservationData.value.userId) {
    toast.add({
      severity: 'error',
      summary: 'Error de Usuario',
      detail: 'Debe iniciar sesión para realizar una reserva.',
      life: 5000
    });
  }
  if (!reservationData.value.roomId) {
    toast.add({
      severity: 'error',
      summary: 'Error de Ruta',
      detail: 'ID de habitación faltante en la ruta. Regrese a la vista del hotel.',
      life: 5000
    });
  }
});
</script>

<template>
  <div class="create-reservation-container">
    <pv-toast position="top-right"/>

    <div class="form-wrapper">
      <div class="back-button-wrapper">
        <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="back-btn"
            @click="goBack"
        />
      </div>

      <div class="form-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <div>
            <h1 class="card-title">Nueva Reserva</h1>
            <p class="card-subtitle">
              Habitación ID: <span class="room-badge">{{ reservationData.roomId || 'N/A' }}</span>
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="form-content">
          <div class="info-section">
            <div class="info-card">
              <label class="info-label">Usuario Autenticado</label>
              <pv-input-text
                  :modelValue="reservationData.userId || 'Cargando...'"
                  disabled
                  class="info-input"
              />
            </div>

            <div class="info-card">
              <label class="info-label">Habitación Seleccionada</label>
              <pv-input-text
                  :modelValue="reservationData.roomId || 'N/A'"
                  disabled
                  class="info-input"
              />
            </div>
          </div>

          <div class="divider-section">
            <div class="divider-line"></div>
            <span class="divider-text">Fechas de Estancia</span>
            <div class="divider-line"></div>
          </div>

          <div class="dates-section">
            <div class="date-field">
              <label for="checkInDate" class="date-label">
                <i class="pi pi-calendar"></i>
                Fecha de Check-In
              </label>
              <pv-calendar
                  id="checkInDate"
                  :modelValue="reservationData.checkInDate"
                  disabled
                  dateFormat="dd/mm/yy"
                  class="date-input disabled"
              />
              <small class="date-hint">El check-in es hoy y no puede modificarse</small>
            </div>

            <div class="date-field">
              <label for="checkOutDate" class="date-label required">
                <i class="pi pi-calendar"></i>
                Fecha de Check-Out
              </label>
              <pv-calendar
                  id="checkOutDate"
                  v-model="reservationData.checkOutDate"
                  :minDate="minCheckOutDate"
                  :manualInput="false"
                  showIcon
                  dateFormat="dd/mm/yy"
                  placeholder="Seleccione fecha de salida"
                  :class="{'invalid-date': reservationData.checkOutDate && reservationData.checkOutDate <= reservationData.checkInDate}"
                  class="date-input"
              />
              <small v-if="reservationData.checkOutDate && reservationData.checkOutDate <= reservationData.checkInDate"
                     class="error-hint">
                <i class="pi pi-exclamation-circle"></i>
                La fecha de salida debe ser posterior a la de llegada
              </small>
            </div>
          </div>

          <div class="form-actions">
            <pv-button
                type="submit"
                label="Confirmar Reserva"
                icon="pi pi-check-circle"
                :loading="loading"
                :disabled="!isFormValid || loading"
                class="submit-btn"
            />
          </div>

          <pv-message
              v-if="reservationStore.errors.length"
              severity="error"
              class="error-message"
          >
            {{ reservationStore.errors[0]?.message || 'Error desconocido al procesar.' }}
          </pv-message>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.create-reservation-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-wrapper {
  width: 100%;
  max-width: 700px;
  animation: fadeInScale 0.5s ease-out;
}

.back-button-wrapper {
  margin-bottom: 1.5rem;
}

.back-btn {
  background: white;
  color: #3b82f6;
  border: 2px solid #bfdbfe;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f0f9ff;
  transform: translateX(-5px);
}

.form-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  padding: 2.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper i {
  font-size: 2rem;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.card-subtitle {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.95;
}

.room-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
}

.form-content {
  padding: 2rem;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: slideUp 0.4s ease-out;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.info-input {
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
  border-radius: 12px;
}

.divider-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.divider-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.divider-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dates-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: slideUp 0.5s ease-out;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.date-label i {
  color: #3b82f6;
  font-size: 1rem;
}

.date-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.25rem;
  font-size: 1.125rem;
}

.date-input {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.date-input:not(.disabled):focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.date-input.disabled {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  cursor: not-allowed;
}

.date-input.invalid-date {
  border-color: #ef4444;
}

.date-hint {
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}

.error-hint {
  font-size: 0.8rem;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
}

.error-hint i {
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1.5rem;
  border-radius: 12px;
  animation: slideUp 0.3s ease-out;
}

@media (max-width: 768px) {
  .create-reservation-container {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .info-section,
  .dates-section {
    grid-template-columns: 1fr;
  }

  .form-content {
    padding: 1.5rem;
  }
}
</style>