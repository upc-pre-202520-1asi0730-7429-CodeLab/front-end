<script setup>
import {ref, onMounted, computed} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useToast} from 'primevue/usetoast';
import {useRoomStore} from "../../Application/room.store.js";

const roomStore = useRoomStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const CLOUD_NAME = 'doekyziqa';
const UPLOAD_PRESET = 'hotel_unsigned_upload';

const roomIdFromRoute = parseInt(route.params.id);
const hotelIdFromRoute = parseInt(route.params.hotelId);

const form = ref({
  id: roomIdFromRoute,
  imagen: "",
  type: "",
  price: 0,
  hotelId: hotelIdFromRoute,
});

const imageFile = ref(null);
const localError = ref("");
const isImageUploading = ref(false);
const fileInput = ref(null);
const initialImageUrl = ref("");

const roomTypes = ref([
  {name: 'Premium', value: 'Premium'},
  {name: 'Basic', value: 'Basic'},
  {name: 'Exclusive', value: 'Exclusive'},
]);

const isSubmitting = computed(() => roomStore.loading || isImageUploading.value);
const isFormInvalid = computed(() => (
    !form.value.type ||
    form.value.price <= 0 ||
    (!form.value.imagen && !imageFile.value)
));

onMounted(async () => {
  if (isNaN(roomIdFromRoute) || isNaN(hotelIdFromRoute)) {
    localError.value = "Error: ID de habitación o hotel no válido en la ruta.";
    return;
  }

  await roomStore.fetchRoomById(roomIdFromRoute);

  if (roomStore.currentRoom) {
    const room = roomStore.currentRoom;
    form.value.imagen = room.imagen || "";
    form.value.type = room.type || "";
    form.value.price = room.price || 0;
    initialImageUrl.value = room.imagen || "";

    if (room.hotelId !== hotelIdFromRoute) {
      console.warn("Advertencia: El hotelId de la ruta no coincide con el de la habitación.");
    }
  } else if (roomStore.errors.length > 0) {
    localError.value = `Error al cargar la habitación: ${roomStore.errors[0]}`;
  } else {
    localError.value = "No se encontraron datos para esta habitación.";
  }
});

const onFileSelected = (event) => {
  const file = event.target.files[0];
  localError.value = "";

  if (file) {
    imageFile.value = file;
    form.value.imagen = '';
  }
};

const uploadImageToCloudinary = async () => {
  if (!imageFile.value) {
    return form.value.imagen || initialImageUrl.value;
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary no está configurado.");
  }

  const formData = new FormData();
  formData.append('file', imageFile.value);
  formData.append('upload_preset', UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  isImageUploading.value = true;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary error: ${errorData.error.message}`);
    }

    const data = await response.json();
    isImageUploading.value = false;
    return data.secure_url;
  } catch (e) {
    isImageUploading.value = false;
    localError.value = `Error al subir la imagen: ${e.message || 'Error desconocido.'}`;
    throw e;
  }
};

const handleUpdate = async () => {
  localError.value = "";
  roomStore.errors = [];

  if (isFormInvalid.value || isNaN(form.value.hotelId)) {
    localError.value = "Por favor, completa todos los campos requeridos.";
    return;
  }

  let finalImageUrl = form.value.imagen || initialImageUrl.value;

  if (imageFile.value) {
    try {
      finalImageUrl = await uploadImageToCloudinary();
    } catch (e) {
      return;
    }
    imageFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = null;
    }
  }

  const roomData = {
    id: roomIdFromRoute,
    imagen: finalImageUrl,
    type: form.value.type,
    price: form.value.price,
    hotelId: form.value.hotelId,
  };

  const ok = await roomStore.updateRoom(roomIdFromRoute, roomData);

  if (ok) {
    toast.add({
      severity: 'success',
      summary: 'Actualizada',
      detail: "Habitación modificada correctamente. Redirigiendo...",
      life: 2500
    });

    setTimeout(() => {
      router.push("/rooms");
    }, 1500);

  } else {
    const storeError = roomStore.errors.length > 0 ? roomStore.errors[0] : "Error desconocido al modificar la habitación.";
    localError.value = `No se pudo actualizar la habitación: ${storeError}`;
    toast.add({severity: 'error', summary: 'Error de API', detail: localError.value, life: 5000});
  }
};

const goBack = () => router.push("/rooms");
</script>

<template>
  <div class="edit-room-container">
    <pv-toast position="top-right"/>

    <div class="form-wrapper">
      <div class="form-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <i class="pi pi-pencil"></i>
          </div>
          <div>
            <h1 class="card-title">Editar Habitación</h1>
            <p class="card-subtitle">ID: {{ roomIdFromRoute }} | Hotel ID: {{ hotelIdFromRoute }}</p>
          </div>
        </div>

        <div v-if="roomStore.loading && !roomStore.currentRoom" class="loading-state">
          <div class="spinner-wrapper">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <p>Cargando datos de la habitación...</p>
        </div>

        <form v-else @submit.prevent="handleUpdate" class="form-content">
          <div v-if="localError" class="error-alert">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ localError }}</span>
          </div>

          <div v-for="(err, index) in roomStore.errors" :key="index" class="error-alert">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ err }}</span>
          </div>

          <div class="form-section">
            <label class="section-label">
              <i class="pi pi-tag"></i>
              Tipo de Habitación
            </label>
            <pv-dropdown
                v-model="form.type"
                :options="roomTypes"
                optionLabel="name"
                optionValue="value"
                placeholder="Seleccione un tipo"
                required
                :disabled="isSubmitting"
                class="input-field"
            />
          </div>

          <div class="form-section">
            <label class="section-label">
              <i class="pi pi-dollar"></i>
              Precio por Noche
            </label>
            <pv-input-number
                v-model="form.price"
                mode="currency"
                currency="USD"
                locale="en-US"
                :min="0"
                :maxFractionDigits="2"
                required
                :disabled="isSubmitting"
                class="input-field"
            />
          </div>

          <div class="form-section image-section">
            <label class="section-label">
              <i class="pi pi-image"></i>
              Gestión de Imagen
            </label>

            <div v-if="initialImageUrl" class="current-image-preview">
              <p class="preview-label">Imagen Actual:</p>
              <div class="image-container">
                <img :src="initialImageUrl" alt="Imagen Actual"/>
              </div>
            </div>

            <div class="image-input-wrapper">
              <pv-input-text
                  v-model="form.imagen"
                  :disabled="isSubmitting || !!imageFile || isImageUploading"
                  placeholder="Pega una nueva URL"
                  class="input-field"
              />

              <div class="divider">
                <span>O</span>
              </div>

              <div class="file-upload-area">
                <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    @change="onFileSelected"
                    :disabled="isSubmitting"
                    id="file-input"
                    hidden
                />
                <label for="file-input" class="file-upload-label">
                  <i class="pi pi-cloud-upload"></i>
                  <span>Subir nueva imagen</span>
                </label>
              </div>

              <div v-if="imageFile" class="file-selected">
                <i class="pi pi-check-circle"></i>
                <span>{{ imageFile.name }}</span>
              </div>

              <div v-else-if="form.imagen" class="file-selected success">
                <i class="pi pi-link"></i>
                <span>URL manual configurada</span>
              </div>

              <div v-else-if="initialImageUrl" class="file-selected info">
                <i class="pi pi-info-circle"></i>
                <span>Manteniendo imagen original</span>
              </div>

              <div v-if="isImageUploading" class="uploading-state">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Subiendo imagen...</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <pv-button
                type="button"
                label="Cancelar"
                icon="pi pi-arrow-left"
                class="btn-cancel"
                @click="goBack"
                :disabled="isSubmitting"
            />
            <pv-button
                type="submit"
                label="Guardar Cambios"
                icon="pi pi-save"
                class="btn-submit"
                :loading="isSubmitting"
                :disabled="isFormInvalid"
            />
          </div>
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.edit-room-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-wrapper {
  width: 100%;
  max-width: 650px;
  animation: fadeInScale 0.5s ease-out;
}

.form-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
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
  margin: 0 0 0.25rem;
}

.card-subtitle {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.9;
}

.loading-state {
  padding: 4rem 2rem;
  text-align: center;
}

.spinner-wrapper {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-wrapper i {
  font-size: 2rem;
  color: white;
}

.form-content {
  padding: 2rem;
}

.error-alert {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideUp 0.3s ease-out;
}

.error-alert i {
  color: #dc2626;
  font-size: 1.25rem;
}

.error-alert span {
  color: #991b1b;
  font-size: 0.95rem;
}

.form-section {
  margin-bottom: 2rem;
  animation: slideUp 0.4s ease-out;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.section-label i {
  color: #f59e0b;
}

.input-field {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
}

.image-section {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  padding: 1.5rem;
  border-radius: 16px;
}

.current-image-preview {
  margin-bottom: 1.5rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.75rem;
}

.image-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-container img {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: cover;
  display: block;
}

.image-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.divider {
  text-align: center;
  position: relative;
  margin: 0.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #cbd5e1;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-label:hover {
  border-color: #f59e0b;
  background: #fffbeb;
}

.file-upload-label i {
  font-size: 2.5rem;
  color: #f59e0b;
}

.file-upload-label span {
  color: #475569;
  font-weight: 600;
}

.file-selected {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideUp 0.3s ease-out;
}

.file-selected i {
  color: #1e40af;
  font-size: 1.25rem;
}

.file-selected span {
  color: #1e40af;
  font-weight: 600;
  font-size: 0.9rem;
}

.file-selected.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.file-selected.success i,
.file-selected.success span {
  color: #047857;
}

.file-selected.info {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.file-selected.info i,
.file-selected.info span {
  color: #4338ca;
}

.uploading-state {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.uploading-state i {
  color: #b45309;
  font-size: 1.25rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.uploading-state span {
  color: #92400e;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #fef3c7;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
}

.btn-cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.btn-submit {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

@media (max-width: 640px) {
  .edit-room-container {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>