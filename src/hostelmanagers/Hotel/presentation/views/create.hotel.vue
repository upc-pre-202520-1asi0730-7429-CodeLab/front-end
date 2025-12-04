<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const router = useRouter();

const CLOUD_NAME = 'doekyziqa';
const UPLOAD_PRESET = 'hotel_unsigned_upload';

const form = ref({
  name: "",
  images: "",
  address: "",
  phone: "",
  userId: 0
});

const imageFile = ref(null);
const error = ref("");
const success = ref("");
const isSubmitting = computed(() => store.loading);

onMounted(() => {
  const raw = localStorage.getItem("currentUser");
  if (raw) {
    try {
      const currentUser = JSON.parse(raw);
      if (currentUser && currentUser.id) {
        form.value.userId = currentUser.id;
      }
    } catch (e) {
      console.error("Error al parsear currentUser:", e);
    }
  }
});

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    form.value.images = '';
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

const handleCreate = async () => {
  error.value = "";
  success.value = "";

  if (!form.value.userId) {
    error.value = "Error: El ID de usuario no está asignado.";
    return;
  }

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

  const hotelData = {
    ...form.value,
    images: finalImageUrl,
  };

  const ok = await store.createHotel(hotelData);

  if (ok) {
    success.value = "Hotel creado correctamente. Redirigiendo...";

    form.value = {
      name: "",
      images: "",
      address: "",
      phone: "",
      userId: form.value.userId
    };
    imageFile.value = null;

    setTimeout(() => {
      router.push("/hotels");
    }, 1500);

  } else {
    const storeError = store.errors.length > 0 ? store.errors[0] : "Error desconocido.";
    error.value = `No se pudo crear el hotel: ${storeError}`;
  }
};

const goBack = () => router.push({ name: "hotels" });
</script>

<template>
  <div class="create-hotel-container">
    <div class="form-wrapper">
      <div class="form-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <i class="pi pi-plus-circle"></i>
          </div>
          <div>
            <h1 class="card-title">Añadir Nuevo Hotel</h1>
            <p class="card-subtitle">Expande tu cadena hotelera</p>
          </div>
        </div>

        <form @submit.prevent="handleCreate" class="form-content">
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
                :disabled="isSubmitting"
                placeholder="Ej: Hotel Vista al Mar"
            />
          </div>

          <div class="form-section image-section">
            <label class="section-label">
              <i class="pi pi-image"></i>
              Imagen Principal
            </label>

            <div class="image-input-wrapper">
              <pv-input-text
                  v-model="form.images"
                  :disabled="isSubmitting || !!imageFile"
                  placeholder="Pega una URL de imagen"
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
                    :disabled="isSubmitting"
                    id="file-input"
                    hidden
                />
                <label for="file-input" class="file-upload-label">
                  <i class="pi pi-cloud-upload"></i>
                  <span>Subir desde tu dispositivo</span>
                </label>
              </div>

              <div v-if="imageFile" class="file-selected">
                <i class="pi pi-check-circle"></i>
                <span>{{ imageFile.name }}</span>
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
                :disabled="isSubmitting"
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
                :disabled="isSubmitting"
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
                :disabled="isSubmitting"
            />
            <pv-button
                type="submit"
                label="Crear Hotel"
                icon="pi pi-check"
                class="btn-submit"
                :loading="isSubmitting"
                :disabled="!form.name || !form.userId || (!form.images && !imageFile)"
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

.create-hotel-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
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
  color: #10b981;
}

.input-field {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  padding: 0.875rem 1rem;
}

.input-field:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.image-section {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 1.5rem;
  border-radius: 16px;
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
  border-color: #10b981;
  background: #f0fdf4;
}

.file-upload-label i {
  font-size: 2.5rem;
  color: #10b981;
}

.file-upload-label span {
  color: #475569;
  font-weight: 600;
}

.file-selected {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideUp 0.3s ease-out;
}

.file-selected i {
  color: #047857;
  font-size: 1.25rem;
}

.file-selected span {
  color: #047857;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
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
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

@media (max-width: 640px) {
  .create-hotel-container {
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