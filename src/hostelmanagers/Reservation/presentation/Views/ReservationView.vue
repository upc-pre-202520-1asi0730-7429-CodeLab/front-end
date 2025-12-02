<script setup>
import { ref, onMounted, computed } from 'vue';
import useUserStore from '../../../IAM/application/user.store.js';
import { useToast } from 'primevue/usetoast';
import { useReservationStore } from "../../application/reservation.store.js";

// 🚀 Importaciones de Componentes de PrimeVue (Sin prefijo Pv)
import Card from 'primevue/card';
import Button from 'primevue/button'; // Mantenido, aunque no usado en la plantilla final, por si se necesita
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

defineOptions({
  name: 'ReservationView'
});

// --- Stores y Hooks ---
const reservationStore = useReservationStore();
const userStore = useUserStore();
const toast = useToast();

// --- Estado Reactivo ---
const loading = ref(true);

// --- Propiedades Computadas ---

/**
 * Obtiene las reservas del store. Filtra opcionalmente por userId si el usuario es 'Client'.
 */
const reservations = computed(() => {
  const currentUserId = userStore.currentUser?.id; // Puede ser INT
  const userRole = userStore.currentUser?.role;

  // 🔑 CORRECCIÓN: Convertir el ID del usuario autenticado a STRING para la comparación
  const currentUserIdString = currentUserId ? String(currentUserId) : null;

  if (userRole === 'Client' && currentUserIdString) {
    // Usamos el ID como STRING para comparar con res.userId (que viene como STRING de la API)
    return reservationStore.reservations.filter(res => res.userId === currentUserIdString);
  }

  // Para roles de Admin/Manager, mostramos todas las reservas
  return reservationStore.reservations;
});

/**
 * Devuelve la severidad (color) del estado para aplicar estilos visuales.
 * @param {string} status - El estado de la reserva.
 */
const getStatusSeverity = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'success';
    case 'Pending':
      return 'info';
    case 'Cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

// --- Lógica de Carga ---

/**
 * Carga las reservas desde el store.
 */
const loadReservations = async () => {
  loading.value = true;
  try {
    await reservationStore.fetchReservations();
  } catch (error) {
    console.error("Error al cargar las reservas:", error);
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: 'No se pudieron recuperar las reservas. Intente de nuevo.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// --- Ciclo de Vida ---
onMounted(() => {
  if (!userStore.currentUser) {
    toast.add({
      severity: 'warn',
      summary: 'Acceso Denegado',
      detail: 'Debe iniciar sesión para ver las reservas.',
      life: 5000
    });
  } else {
    loadReservations();
  }
});
</script>

<template>
  <div class="reservation-view-container p-4">

    <Toast position="top-right" />

    <h1 class="text-3xl font-bold mb-6 flex items-center text-primary">
      <i class="pi pi-calendar-check mr-3"></i>
      Mis Reservas
    </h1>

    <div v-if="loading" class="loading-panel text-center p-5 border rounded-lg bg-white shadow-sm">
      <ProgressSpinner class="w-10 h-10" />
      <p class="mt-3 text-lg text-gray-600">Cargando listado de reservas...</p>
    </div>

    <div v-else-if="reservationStore.errors.length" class="error-panel">
      <Message severity="error">
        Error al cargar: {{ reservationStore.errors[0]?.message || 'Error desconocido del servidor.' }}
      </Message>
    </div>

    <Card v-else class="shadow-lg">
      <template #content>

        <div v-if="reservations.length === 0" class="no-data-panel text-center p-5 bg-yellow-50 text-yellow-800 border-yellow-200 border rounded-lg">
          <i class="pi pi-info-circle text-3xl mb-2"></i>
          <p class="text-lg font-medium">No se encontraron reservas.</p>
          <p class="text-sm">¡Comience a planificar su próximo viaje!</p>
        </div>

        <DataTable v-else :value="reservations" :paginator="true" :rows="10"
                   dataKey="id" class="p-datatable-gridlines">

          <Column field="id" header="ID" :sortable="true" style="width: 80px;"></Column>

          <Column field="roomId" header="Habitación ID" :sortable="true"></Column>

          <Column field="checkInDate" header="Llegada" :sortable="true">
            <template #body="{ data }">
              {{ new Date(data.checkInDate).toLocaleDateString() }}
            </template>
          </Column>

          <Column field="checkOutDate" header="Salida" :sortable="true">
            <template #body="{ data }">
              {{ new Date(data.checkOutDate).toLocaleDateString() }}
            </template>
          </Column>

          <Column field="status" header="Estado" :sortable="true">
            <template #body="{ data }">
                    <span :class="['p-tag', 'p-tag-' + getStatusSeverity(data.status)]">
                        {{ data.status }}
                    </span>
            </template>
          </Column>

        </DataTable>

      </template>
    </Card>
  </div>
</template>

<style scoped>
.reservation-view-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.text-primary {
  color: #007bff;
}

.p-tag {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Clases para los Tags de Estado (ejemplos) */
.p-tag-success {
  background-color: #10b981;
  color: white;
}
.p-tag-info {
  background-color: #3b82f6;
  color: white;
}
.p-tag-danger {
  background-color: #ef4444;
  color: white;
}
.p-tag-secondary {
  background-color: #6b7280;
  color: white;
}

.p-datatable-gridlines {
  /* Estilos adicionales para la tabla si es necesario */
}
</style>