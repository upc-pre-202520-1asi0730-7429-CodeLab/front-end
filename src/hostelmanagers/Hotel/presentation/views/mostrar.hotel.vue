<script setup>
import { onMounted, watch, computed } from "vue";
import useHotelStore from "../../application/hotel.store.js";
import useUserStore from '../../../IAM/application/user.store.js';
import { useToast } from 'primevue/usetoast';
import Tooltip from 'primevue/tooltip';

const store = useHotelStore();
const userStore = useUserStore();
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

const canModify = computed(() => {
  return userStore.currentUser?.role !== 'Client';
});

const handleDelete = async (id, name) => {
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
  <div class="hotels-admin-container">
    <pv-toast position="top-right" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <div class="icon-badge">
            <i class="pi pi-building"></i>
          </div>
          <div>
            <h1 class="page-title">Gestión de Hoteles</h1>
            <p class="page-subtitle">Administra tu cadena hotelera</p>
          </div>
        </div>

        <RouterLink to="/hotels/create" v-if="canModify" class="create-link">
          <pv-button
              label="Añadir Nuevo Hotel"
              icon="pi pi-plus"
              class="create-btn"
          />
        </RouterLink>
      </div>
    </div>

    <div class="table-wrapper">
      <pv-data-table
          :value="store.hotels"
          dataKey="id"
          :loading="store.loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 20, 50]"
          class="hotels-table"
      >
        <template #loading>
          <div class="loading-state">
            <div class="loading-spinner">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <p>Cargando hoteles...</p>
          </div>
        </template>

        <pv-column field="id" header="ID" class="col-id">
          <template #body="{ data }">
            <span class="id-badge">{{ (data.id + '').substring(0, 4) }}...</span>
          </template>
        </pv-column>

        <pv-column field="images" header="Imagen" class="col-image">
          <template #body="{ data }">
            <div v-if="data.images && typeof data.images === 'string'" class="image-wrapper">
              <img
                  :src="data.images"
                  alt="Imagen del Hotel"
                  class="hotel-thumbnail"
              />
            </div>
            <div v-else class="no-image">
              <i class="pi pi-image"></i>
            </div>
          </template>
        </pv-column>

        <pv-column field="name" header="Nombre" :sortable="true">
          <template #body="{ data }">
            <span class="hotel-name">{{ data.name }}</span>
          </template>
        </pv-column>

        <pv-column field="address" header="Dirección" class="col-address">
          <template #body="{ data }">
            <div class="address-info">
              <i class="pi pi-map-marker"></i>
              <span>{{ data.address }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column field="phone" header="Teléfono" class="col-phone">
          <template #body="{ data }">
            <div class="phone-info">
              <i class="pi pi-phone"></i>
              <span>{{ data.phone }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column header="Acciones" class="col-actions" v-if="canModify">
          <template #body="{ data }">
            <div class="action-buttons">
              <RouterLink :to="`/hotels/${data.id}/edit`">
                <pv-button
                    icon="pi pi-pencil"
                    class="action-btn edit-btn"
                    v-tooltip.top="'Editar Hotel'"
                />
              </RouterLink>
              <pv-button
                  icon="pi pi-trash"
                  class="action-btn delete-btn"
                  v-tooltip.top="'Eliminar Hotel'"
                  @click="handleDelete(data.id, data.name)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <div v-if="store.errors.length" class="error-section">
      <pv-message severity="error">
        <div class="error-content">
          <i class="pi pi-exclamation-triangle"></i>
          <span>No se pudo obtener la lista de hoteles. Por favor, revise su conexión.</span>
        </div>
      </pv-message>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.hotels-admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
}

.page-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease-out;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.icon-badge i {
  font-size: 2rem;
  color: white;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.create-link {
  text-decoration: none;
}

.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.table-wrapper {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.hotels-table {
  border-radius: 20px;
}

.hotels-table :deep(.p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.hotels-table :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
}

.hotels-table :deep(.p-datatable-tbody > tr:hover) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  transform: scale(1.01);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideIn 0.5s ease-out;
}

.loading-spinner i {
  font-size: 2.5rem;
  color: white;
}

.col-id {
  width: 100px;
}

.id-badge {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
}

.col-image {
  width: 120px;
}

.image-wrapper {
  width: 100px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-wrapper:hover {
  transform: scale(1.05);
}

.hotel-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100px;
  height: 70px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.5rem;
}

.hotel-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.address-info,
.phone-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.address-info i,
.phone-info i {
  color: #3b82f6;
}

.col-actions {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;
}

.edit-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
}

.error-section {
  margin-top: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-content i {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .hotels-admin-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title-section {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>