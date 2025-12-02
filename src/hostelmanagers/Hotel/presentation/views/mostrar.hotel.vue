<script setup>
import { onMounted, watch, computed } from "vue"; // Importar 'computed'
import useHotelStore from "../../application/hotel.store.js";
import useUserStore from '../../../IAM/application/user.store.js';
import { useToast } from 'primevue/usetoast';
import Tooltip from 'primevue/tooltip';

const store = useHotelStore();
const userStore = useUserStore();// 👈 INSTANCIA DEL USER STORE
const toast = useToast();

const vTooltip = Tooltip;

onMounted(() => {
  store.fetchHotels();
});

watch(
    () => store.errors.length,
    (newErrorsCount) => {
      if (newErrorsCount > 0) {
        toast.add({
          severity: 'error',
          summary: 'Error de Carga',
          detail: 'No se pudieron cargar los hoteles. Por favor, intente de nuevo.',
          life: 5000
        });
      }
    }
);

/**
 * Propiedad computada para determinar si el usuario puede modificar/crear hoteles.
 * Es true si el rol NO es 'Client'.
 */
const canModify = computed(() => {
  // Si no hay usuario o si el rol no es 'Client', permitimos la modificación.
  // Asumimos que solo 'Client' debe estar restringido.
  return userStore.currentUser?.role !== 'Client';
});


/**
 * Maneja la eliminación de un hotel dado su ID.
 * @param {number} id - El ID del hotel a eliminar.
 * @param {string} name - El nombre del hotel (para el mensaje).
 */
const handleDelete = async (id, name) => {
  // Aseguramos que solo los usuarios autorizados puedan intentar la eliminación
  if (!canModify.value) {
    toast.add({
      severity: 'warn',
      summary: 'Acción No Permitida',
      detail: 'Tu rol no te permite eliminar hoteles.',
      life: 3000
    });
    return;
  }

  if (!confirm(`¿Estás seguro de que deseas eliminar el hotel "${name}"? Esta acción es irreversible.`)) {
    return;
  }

  const success = await store.deleteHotel(id);

  if (success) {
    toast.add({
      severity: 'success',
      summary: 'Eliminación Exitosa',
      detail: `El hotel "${name}" ha sido eliminado.`,
      life: 3000
    });
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error al Eliminar',
      detail: store.errors.length > 0 ? store.errors[0].toString() : `No se pudo eliminar el hotel "${name}".`,
      life: 5000
    });
  }
};

</script>

<template>
  <div class="hotels-page-container">

    <pv-toast position="top-right" />

    <div class="page-header-section">
      <h1 class="page-title-main">
        <i class="pi pi-building header-icon"></i>
        Gestión de Hoteles
      </h1>

      <RouterLink to="/hotels/create" v-if="canModify">
        <pv-button
            label="Añadir Nuevo Hotel"
            icon="pi pi-plus"
            class="p-button-primary p-button-sm p-button-rounded action-button"
        />
      </RouterLink>
    </div>

    <div class="table-card-wrapper">
      <pv-data-table
          :value="store.hotels"
          dataKey="id"
          :loading="store.loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 20, 50]"
          class="hotels-data-table"
      >
        <template #loading>
          <div class="loading-state">
            <i class="pi pi-spin pi-spinner loading-icon"></i> Cargando datos de hoteles...
          </div>
        </template>

        <pv-column field="id" header="ID" class="col-id">
          <template #body="{ data }">
            <span class="id-text">{{ (data.id + '').substring(0, 4) }}...</span>
          </template>
        </pv-column>

        <pv-column field="images" header="Imagen" class="col-image">
          <template #body="{ data }">
            <div v-if="data.images && typeof data.images === 'string'">
              <img
                  :src="data.images"
                  alt="Imagen del Hotel"
                  class="hotel-image"
              />
            </div>
            <div v-else class="no-image-placeholder">
              <i class="pi pi-image"></i>
            </div>
          </template>
        </pv-column>

        <pv-column field="name" header="Nombre" :sortable="true">
          <template #body="{ data }">
            <span class="name-text">{{ data.name }}</span>
          </template>
        </pv-column>

        <pv-column field="address" header="Dirección" class="col-address" />
        <pv-column field="phone" header="Teléfono" class="col-phone" />

        <pv-column header="Acciones" class="col-actions" v-if="canModify">
          <template #body="{ data }">
            <RouterLink :to="`/hotels/${data.id}/edit`" class="action-link">
              <pv-button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-warning mr-1"
                  v-tooltip.top="'Editar Hotel'"
              />
            </RouterLink>
            <pv-button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                v-tooltip.top="'Eliminar Hotel'"
                @click="handleDelete(data.id, data.name)" />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <div v-if="store.errors.length" class="error-message-wrapper">
      <pv-message severity="error">
        <i class="pi pi-exclamation-triangle error-message-icon"></i> No se pudo obtener la lista de hoteles. Por favor, revise su conexión.
      </pv-message>
    </div>

  </div>
</template>

<style scoped>
/* (Los estilos proporcionados se mantienen aquí) */

/* -------------------------------------- */
/* LAYOUT BASE Y PÁGINA */
/* -------------------------------------- */

.hotels-page-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.page-title-main {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 0.75rem;
  color: #007bff;
  font-size: 1.5rem;
}

.action-button {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-button:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

/* -------------------------------------- */
/* TABLA Y CONTENEDOR */
/* -------------------------------------- */

.table-card-wrapper {
  background-color: #ffffff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Estilos de PrimeVue internos (usando :deep para modificarlos) */
.hotels-data-table :deep(.p-datatable-header) {
  background-color: #f8f9fa;
  padding: 1.25rem 1.5rem;
  font-weight: 600;
  color: #495057;
}

.hotels-data-table :deep(.p-datatable-thead > tr > th) {
  background-color: #e9ecef;
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
}

.hotels-data-table :deep(.p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

.hotels-data-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: #f1f3f5 !important;
}

/* Estilos de columnas específicas */
.col-id {
  width: 6rem;
}
.id-text {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6c757d;
}

.col-image {
  width: 8rem;
}
.hotel-image {
  width: 100%;
  height: 4.5rem;
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.no-image-placeholder {
  text-align: center;
  color: #adb5bd;
  font-size: 1.25rem;
  padding: 0.5rem 0;
}

.name-text {
  font-weight: 600;
  color: #343a40;
}

.col-address, .col-phone {
  font-size: 0.9rem;
  color: #6c757d;
}

.col-actions {
  width: 9rem;
  text-align: center;
}

/* -------------------------------------- */
/* ESTADO DE CARGA Y ERRORES */
/* -------------------------------------- */

.loading-state {
  padding: 1.5rem;
  text-align: center;
  color: #6c757d;
}
.loading-icon {
  margin-right: 0.5rem;
  font-size: 1.5rem;
  color: #007bff;
}

.error-message-wrapper {
  margin-top: 1.5rem;
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.1);
  border-radius: 0.5rem;
}

.error-message-icon {
  margin-right: 0.5rem;
  font-size: 1.25rem;
}
</style>