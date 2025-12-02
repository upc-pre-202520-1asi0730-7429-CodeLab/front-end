<script setup>
import {ref, onMounted, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useToast} from 'primevue/usetoast';
import useUserStore from "../../../IAM/application/user.store.js";
import {useReservationStore} from "../../application/reservation.store.js";

defineOptions({
  name: 'CreateReservation'
});

// --- Stores y Hooks ---
const route = useRoute();
const router = useRouter();
const toast = useToast();
const reservationStore = useReservationStore();
const userStore = useUserStore();

// --- Estado Reactivo del Formulario ---
const loading = ref(false);

const reservationData = ref({
  userId: userStore.currentUser?.id || null, // ID del usuario autenticado (se asume string)
  // 🔑 CORRECCIÓN: Leer el ID de la habitación desde route.params.id (parámetro de ruta)
  roomId: route.params.id || null,
  checkInDate: new Date(),                   // Fecha de Check-In: HOY
  checkOutDate: null,                        // Fecha de Check-Out: Debe ser seleccionada
});

// --- Propiedades Computadas y Lógica de Fechas ---

/**
 * Fecha mínima permitida para la selección de Check-Out:
 * Mañana (el día después de Check-In).
 */
const minCheckOutDate = computed(() => {
  const minDate = new Date(reservationData.value.checkInDate);
  // Clonar la fecha de Check-In y sumar un día
  minDate.setDate(minDate.getDate() + 1);
  return minDate;
});

/**
 * Indica si el formulario es válido para ser enviado.
 */
const isFormValid = computed(() => {
  // Debe haber un userId, un roomId y checkOutDate debe ser posterior a checkInDate
  return (
      !!reservationData.value.userId &&
      !!reservationData.value.roomId &&
      !!reservationData.value.checkOutDate &&
      reservationData.value.checkOutDate > reservationData.value.checkInDate
  );
});

// --- Lógica de Creación ---

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

  // 1. Construcción del Payload con corrección de tipos
  const payload = {
    userId: String(reservationData.value.userId),

    // 🔑 CORRECCIÓN: Convertir roomId de string a NUMBER (int) para el backend
    roomId: reservationData.value.roomId,

    // Convertir fechas a formato ISO string para el tipo DateTime del backend
    checkInDate: reservationData.value.checkInDate.toISOString(),
    checkOutDate: reservationData.value.checkOutDate.toISOString(),

    // NOTA: Se excluye 'status' ya que puede ser generado por el backend,
    // pero si tu API lo requiere, descomenta la siguiente línea:
    // status: 'Pending'
  };

  // 2. LOGGING: Muestra los datos que se enviarán
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
      // Redirigir a la vista de las reservas del usuario
      router.push({name: 'ReservationView'});
    } else {
      // El store ya maneja el error y lo guarda en reservationStore.errors
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

// --- Ciclo de Vida ---
onMounted(() => {
  // Validar si tenemos la información mínima necesaria
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
  <div class="reservation-creation-container">

    <pv-toast position="top-right"/>

    <div class="header-section">
      <pv-button
          icon="pi pi-arrow-left"
          label="Volver"
          class="p-button-text p-button-sm mb-4"
          @click="goBack"
      />
      <h1 class="page-title">
        <i class="pi pi-calendar-plus header-icon"></i>
        Crear Nueva Reserva
      </h1>
      <p class="subtitle">Habitación ID: <span class="room-id-tag">{{ reservationData.roomId || 'N/A' }}</span></p>
    </div>

    <pv-card class="reservation-form-card">
      <template #content>

        <form @submit.prevent="handleSubmit">

          <div class="p-field mb-4">
            <label class="p-label font-bold">Usuario ID (Autenticado)</label>
            <pv-input-text
                :modelValue="reservationData.userId || 'Cargando...'"
                disabled
                class="w-full text-sm disabled-input"
            />
          </div>

          <div class="p-field mb-4">
            <label class="p-label font-bold">Habitación ID</label>
            <pv-input-text
                :modelValue="reservationData.roomId || 'N/A'"
                disabled
                class="w-full text-sm disabled-input"
            />
          </div>

          <pv-divider/>

          <div class="dates-group">

            <div class="p-field flex-1">
              <label for="checkInDate" class="p-label required-label">Fecha de Llegada (Check-In)</label>
              <pv-calendar
                  id="checkInDate"
                  :modelValue="reservationData.checkInDate"
                  disabled
                  dateFormat="dd/mm/yy"
                  class="w-full disabled-calendar"
              />
              <small class="p-error">El Check-In es hoy y no se puede modificar.</small>
            </div>

            <div class="p-field flex-1">
              <label for="checkOutDate" class="p-label required-label">Fecha de Salida (Check-Out)</label>
              <pv-calendar
                  id="checkOutDate"
                  v-model="reservationData.checkOutDate"
                  :minDate="minCheckOutDate"
                  :manualInput="false"
                  showIcon
                  dateFormat="dd/mm/yy"
                  placeholder="Seleccione fecha de salida"
                  :class="{'p-invalid': reservationData.checkOutDate && reservationData.checkOutDate <= reservationData.checkInDate}"
                  class="w-full"
              />
              <small v-if="reservationData.checkOutDate && reservationData.checkOutDate <= reservationData.checkInDate"
                     class="p-error">
                La fecha de salida debe ser posterior a la de llegada.
              </small>
            </div>

          </div>

          <div class="p-form-actions mt-6">
            <pv-button
                type="submit"
                label="Confirmar Reserva"
                icon="pi pi-check-circle"
                :loading="loading"
                :disabled="!isFormValid || loading"
                class="w-full p-button-success"
            />
          </div>

          <pv-message
              v-if="reservationStore.errors.length"
              severity="error"
              class="mt-3 w-full"
          >
            {{ reservationStore.errors[0]?.message || 'Error desconocido al procesar.' }}
          </pv-message>

        </form>

      </template>
    </pv-card>

  </div>
</template>

<style scoped>
/* Estilos omitidos por brevedad, asumiendo que ya funcionan correctamente */
.reservation-creation-container {
  padding: 2rem;
  background-color: #f4f4f7;
  min-height: 100vh;
  max-width: 600px; /* Limitar el ancho del formulario */
  margin: 0 auto;
}

.header-section {
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.header-icon {
  margin-right: 0.75rem;
  color: #007bff;
  font-size: 1.5rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #6c757d;
}

.room-id-tag {
  font-weight: 600;
  color: #007bff;
}

.reservation-form-card {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
}

.p-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
}

.required-label::after {
  content: '*';
  color: #dc3545;
  margin-left: 0.25rem;
}

.disabled-input, .disabled-calendar :deep(input) {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed;
}

.dates-group {
  display: flex;
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .dates-group {
    flex-direction: column;
  }
}
</style>