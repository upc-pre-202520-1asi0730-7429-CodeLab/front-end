<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const route = useRoute();
const router = useRouter();

const CLOUD_NAME = 'doekyziqa';
const UPLOAD_PRESET = 'hotel_unsigned_upload';

const form = ref({
  id: null,
  name: "",
  images: "",
  address: "",
  phone: "",
  userId: 0
});

const imageFile = ref(null);
const loading = ref(true);
const error = ref("");
const success = ref("");
const initialImageUrl = ref("");

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    await store.fetchHotelById(id);

    if (store.currentHotel) {
      form.value = { ...store.currentHotel };
      initialImageUrl.value = store.currentHotel.images || "";
    } else {
      error.value = "Hotel no encontrado. Verifique el ID.";
    }
  } catch (err) {
    error.value = "Error al cargar los datos del hotel.";
  } finally {
    loading.value = false;
  }
});

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
  }
};

const uploadImageToCloudinary = async () => {
  if (!imageFile.value) {
    return form.value.images;
  }

  const formData = new FormData();
  formData.append('file', imageFile.value);
  formData.append('upload_preset', UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

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
    return data.secure_url;
  } catch (e) {
    console.error("Cloudinary Upload Error:", e);
    error.value = `Error al subir la imagen: ${e.message || 'Verifica el Cloud Name y el Preset.'}`;
    throw e;
  }
};

const handleUpdate = async () => {
  error.value = "";
  success.value = "";

  const hotelIdForUrl = form.value.id;
  let finalImageUrl = form.value.images;

  if (imageFile.value) {
    store.loading = true;
    try {
      finalImageUrl = await uploadImageToCloudinary();
    } catch (e) {
      store.loading = false;
      return;
    }
    store.loading = false;
  }

  const dataToUpdate = {
    id: hotelIdForUrl,
    name: form.value.name,
    images: finalImageUrl,
    address: form.value.address,
    phone: form.value.phone,
    userId: form.value.userId
  };

  const ok = await store.updateHotel(hotelIdForUrl, dataToUpdate);

  if (ok) {
    success.value = "Hotel actualizado correctamente. Redirigiendo...";
    setTimeout(() => {
      goBack();
    }, 1500);
  } else {
    error.value = store.errors.length > 0 ? store.errors[0] : "No se pudo actualizar el hotel.";
  }
};

const goBack = () => router.push("/hotels");
</script>

<template>
  <div class="edit-hotel-container">
    <div class="form-wrapper">
      <div class="form-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <i class="pi pi-pencil"></i>
          </div>
          <div>
            <h1 class="card-title">Actualizar Hotel</h1>
            <p class="card-subtitle">Modifica la información de tu hotel</p>
          </div>
        </div>

        <div v-if="loading || store.loading" class="loading-state">
          <div class="spinner-wrapper">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <p>Cargando datos del hotel...</p>
        </div>

        <form v-else @submit.prevent="handleUpdate" class="form-content">
          <div v-if="error" class="alert error-alert">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>

          <div v-if="success" class="alert success-alert">
            <i class="pi pi-check-circle"></i>
            <span>{{ success }}</span>
          </div>

          <div class="form-section">
            <label class="section-label">
              <i class="pi pi-building"></i>
              Nombre del Hotel
            </label>
            <pv-input-text
                v-model="form.name"
                required
                class="input-field"
                placeholder="Nombre del hotel"
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
                  v-model="form.images"
                  :disabled="!!imageFile"
                  placeholder="Pega una nueva URL"
                  class="input-field"
              />

              <div class="divider">
                <span>O</span>
              </div>

              <div class="file-upload-area">
                <input
                    type="file"
                    accept="image/*"
                    @change="onFileSelected"
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

              <div v-else-if="form.images && form.images !== initialImageUrl" class="file-selected success">
                <i class="pi pi-link"></i>
                <span>URL actualizada</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="section-label">
              <i class="pi pi-map-marker"></i>
              Dirección
            </label>
            <pv-input-text
                v-model="form.address"
                required
                class="input-field"
                placeholder="Calle, Ciudad, País"
            />
          </div>

          <div class="form-section">
            <label class="section-label">
              <i class="pi pi-phone"></i>
              Teléfono de Contacto
            </label>
            <pv-input-text
                v-model="form.phone"
                required
                class="input-field"
                placeholder="+1 234 567 8900"
            />
          </div>

          <div class="form-actions">
            <pv-button
                type="button"
                label="Cancelar"
                icon="pi pi-arrow-left"
                class="btn-cancel"
                @click="goBack"
            />
            <pv-button
                type="submit"
                label="Guardar Cambios"
                icon="pi pi-save"
                class="btn-submit"
                :loading="store.loading"
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

.edit-hotel-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-wrapper i {
  font-size: 2rem;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
}

.form-content {
  padding: 2rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideUp 0.3s ease-out;
}

.error-alert {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.error-alert i {
  color: #dc2626;
  font-size: 1.25rem;
}

.success-alert {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #10b981;
  color: #065f46;
}

.success-alert i {
  color: #059669;
  font-size: 1.25rem;
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
  color: #3b82f6;
}

.input-field {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  padding: 0.875rem 1rem;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.image-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem;
  border-radius: 16px;
}

.current-image-preview {
  margin-bottom: 1.5rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
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
  border-color: #3b82f6;
  background: #f0f9ff;
}

.file-upload-label i {
  font-size: 2.5rem;
  color: #3b82f6;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #e0f2fe;
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

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

@media (max-width: 640px) {
  .edit-hotel-container {
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