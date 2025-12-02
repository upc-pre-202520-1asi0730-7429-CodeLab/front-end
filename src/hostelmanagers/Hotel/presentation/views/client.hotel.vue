<script setup>
import { onMounted, watch, ref, computed } from "vue"; // 🔑 Importamos ref y computed
import { useRouter } from 'vue-router';
import useHotelStore from "../../application/hotel.store.js";
import { useToast } from 'primevue/usetoast';
import Tooltip from 'primevue/tooltip';

// 🚀 Importaciones de componentes necesarios para el filtro
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Message from 'primevue/message';


// 🔑 Define el nombre explícito del componente.
defineOptions({
  name: 'ClientHotelView'
});

const store = useHotelStore();
const toast = useToast();
const router = useRouter();
const vTooltip = Tooltip;

// --- Estado de Filtro ---
const globalFilter = ref(''); // 🔑 Estado reactivo para el campo de búsqueda

// --- Propiedad Computada para la Tabla ---
/**
 * Filtra los hoteles basándose en el valor de globalFilter.
 */
const filteredHotels = computed(() => {
  if (!globalFilter.value) {
    return store.hotels;
  }
  const filterText = globalFilter.value.toLowerCase();

  return store.hotels.filter(hotel => {
    // Filtra por el nombre del hotel
    return hotel.name.toLowerCase().includes(filterText);
  });
});


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
 * Navega a la vista de detalles de un hotel específico.
 * @param {number} id - El ID del hotel.
 */
const viewHotelDetails = (id) => {
  // Asume una ruta de detalles específica para el cliente: /view-hotels/:id
  router.push(`/hotels/details/${id}`);
};

// 🛑 La función viewHotelRooms (Ver Habitaciones) ha sido eliminada.
</script>

<template>
  <div class="hotels-page-container">

    <Toast position="top-right"/>

    <div class="page-header-section">
      <h1 class="page-title-main">
        <i class="pi pi-building header-icon"></i>
        Buscar y Ver Hoteles Disponibles
      </h1>
    </div>

    <div class="table-card-wrapper">

      <div class="filter-toolbar">
        <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
                v-model="globalFilter"
                placeholder="Buscar por Nombre del Hotel"
                class="search-input"
            />
        </span>
      </div>

      <DataTable
          :value="filteredHotels"
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

        <Column field="images" header="Imagen" class="col-image">
          <template #body="{ data }">
            <div v-if="data.images && typeof data.images === 'string'">
              <img
                  :src="data.images"
                  alt="Imagen del Hotel"
                  class="hotel-image"
                  v-tooltip.right="data.name"
              />
            </div>
            <div v-else class="no-image-placeholder">
              <i class="pi pi-image"></i>
            </div>
          </template>
        </Column>

        <Column field="id" header="ID" :sortable="true" class="col-id"/>

        <Column field="name" header="Nombre" :sortable="true">
          <template #body="{ data }">
            <span class="name-text">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="address" header="Ubicación" class="col-address"/>

        <Column field="phone" header="Teléfono" class="col-phone"/>

        <Column header="Acciones" class="col-actions-small">
          <template #body="{ data }">
            <Button
                icon="pi pi-info-circle"
                label="Detalles"
                class="p-button-sm p-button-info"
                v-tooltip.top="'Ver detalles del hotel'"
                @click="viewHotelDetails(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="store.errors.length" class="error-message-wrapper">
      <Message severity="error">
        <i class="pi pi-exclamation-triangle error-message-icon"></i> No se pudo obtener la lista de hoteles.
      </Message>
    </div>

  </div>
</template>

<style scoped>
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

/* -------------------------------------- */
/* FILTRO */
/* -------------------------------------- */
.filter-toolbar {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.search-input {
  width: 20rem;
  padding-left: 2.5rem;
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
/* Nota: Se eliminó el :deep(.p-datatable-header) ya que se usa filter-toolbar */

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

.col-address {
  font-size: 0.9rem;
  color: #6c757d;
}

/* Estilos de columna para los datos */
.col-id, .col-phone {
  width: 8rem;
  font-size: 0.9rem;
}

.col-actions-small {
  width: 10rem;
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