<script setup>
import {ref, onMounted, computed} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useToast} from 'primevue/usetoast';

import {useRoomStore} from '../../application/room.store.js'; // Store de Habitaciones

// --- CONFIGURACIÓN E INICIALIZACIÓN ---

const roomStore = useRoomStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

// ⚠️ CONFIGURACIÓN DE CLOUDINARY
// REEMPLAZA estos valores por los tuyos reales
const CLOUD_NAME = 'doekyziqa';
const UPLOAD_PRESET = 'hotel_unsigned_upload'; // 👈 Asegúrate de usar tu preset para habitaciones.

// --- ESTADO LOCAL ---

const hotelIdFromRoute = parseInt(route.params.hotelId);

// Data del formulario: adaptada a la ROOM
const form = ref({
  imagen: "", // URL de la imagen final
  type: "", // Premium, Basic, Exclusive
  price: 0,
  hotelId: hotelIdFromRoute, // Obtenido de la URL
});

// Referencia para almacenar el archivo de imagen seleccionado
const imageFile = ref(null);

const localError = ref(""); // Para errores locales (ej. Cloudinary)
const localSuccess = ref(""); // Para mensajes de éxito
const isImageUploading = ref(false); // Estado de subida de imagen
const fileInput = ref(null); // Referencia al input de archivo

// Opciones para el campo 'type'
const roomTypes = ref([
  {name: 'Premium', value: 'Premium'},
  {name: 'Basic', value: 'Basic'},
  {name: 'Exclusive', value: 'Exclusive'},
]);


// --- PROPIEDADES CALCULADAS ---

// Comprobamos si el formulario está siendo procesado (incluye store.loading y subida de imagen)
const isSubmitting = computed(() => roomStore.loading || isImageUploading.value);

// Deshabilitar botón de submit si falta data esencial
const isFormInvalid = computed(() => (
    !form.value.type ||
    !form.value.hotelId ||
    form.value.price <= 0 ||
    (!form.value.imagen && !imageFile.value) // Requiere URL manual O archivo
));


// --- INICIALIZACIÓN (Verificación de hotelId) ---

onMounted(() => {
  if (isNaN(hotelIdFromRoute)) {
    localError.value = "Error: ID de hotel no válido en la ruta.";
    router.push({name: 'room-list'}); // Redirigir si falta ID
  }
});


// --- LÓGICA DE IMAGEN (CLOUDINARY) ---

// Función que se activa cuando se selecciona un archivo
const onFileSelected = (event) => {
  const file = event.target.files[0];
  localError.value = ""; // Limpiar errores al seleccionar nuevo archivo

  if (file) {
    imageFile.value = file;
    // Desactivar URL manual si se selecciona archivo
    form.value.imagen = '';
  }
};

/**
 * Sube la imagen seleccionada a Cloudinary.
 * @returns {Promise<string>} La URL segura de la imagen subida.
 */
const uploadImageToCloudinary = async () => {
  if (!imageFile.value) {
    return form.value.imagen; // Si no hay archivo, devuelve la URL manual
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
    throw e; // Relanzamos para detener la creación
  }
};


// --- GESTIÓN DEL FORMULARIO ---

const handleCreate = async () => {
  localError.value = "";
  roomStore.errors = []; // Limpiar errores de la store

  if (isFormInvalid.value || isNaN(form.value.hotelId)) {
    localError.value = "Por favor, completa todos los campos requeridos.";
    return;
  }

  // 1. GESTIONAR SUBIDA DE IMAGEN
  let finalImageUrl = form.value.imagen;

  if (imageFile.value) {
    try {
      finalImageUrl = await uploadImageToCloudinary();
    } catch (e) {
      // El error ya se setea en localError
      return; // Detener si la subida falla
    }

    // Limpiar el archivo después de la subida
    imageFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = null;
    }
  }

  // 2. CONSTRUCCIÓN FINAL
  const roomData = {
    imagen: finalImageUrl, // Usar la URL obtenida (subida o manual)
    type: form.value.type,
    price: form.value.price,
    hotelId: form.value.hotelId,
  };

  // 3. Crear la habitación usando la store
  const ok = await roomStore.createRoom(roomData);

  if (ok) {
    toast.add({
      severity: 'success',
      summary: 'Creada',
      detail: "Habitación creada correctamente. Redirigiendo...",
      life: 2500
    });

    // Limpiar el formulario
    form.value = {
      imagen: "",
      type: "",
      price: 0,
      hotelId: form.value.hotelId // Mantener el hotelId
    };

    // Redirigir a la lista de habitaciones de este hotel
    setTimeout(() => {
      router.push("/rooms");
    }, 1500);

  } else {
    // Si falla el store, mostramos el error de la store
    const storeError = roomStore.errors.length > 0 ? roomStore.errors[0] : "Error desconocido al crear la habitación.";
    localError.value = `No se pudo crear la habitación: ${storeError}`;
    toast.add({severity: 'error', summary: 'Error de API', detail: localError.value, life: 5000});
  }
};

const goBack = () => router.push("/rooms");
</script>

<template>
  <div class="create-page-container">
    <div class="form-card-wrapper">
      <pv-card class="create-form-card">
        <pv-toast position="top-right"/>

        <template #title>
          <div class="card-title-header">
            <i class="pi pi-plus-circle card-title-icon"></i>
            Añadir Nueva Habitación
          </div>
        </template>

        <template #subtitle>
          <p class="text-gray-600">Hotel ID: {{ hotelIdFromRoute }}</p>
        </template>

        <template #content>
          <form @submit.prevent="handleCreate" class="create-form">

            <div class="feedback-messages">
              <pv-message v-if="localError" severity="error" :closable="false">{{ localError }}</pv-message>
              <pv-message v-for="(err, index) in roomStore.errors" :key="index" severity="error" :closable="false">
                {{ err }}
              </pv-message>
            </div>


            <div class="form-field-group">
              <label for="room-type" class="font-bold block mb-2">Tipo de Habitación</label>
              <pv-dropdown
                  id="room-type"
                  v-model="form.type"
                  :options="roomTypes"
                  optionLabel="name"
                  optionValue="value"
                  placeholder="Seleccione un tipo"
                  required
                  :disabled="isSubmitting"
                  class="full-width-input"
              />
            </div>

            <div class="form-field-group">
              <label for="price" class="font-bold block mb-2">Precio por Noche</label>
              <pv-input-number
                  id="price"
                  v-model="form.price"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  :min="0"
                  :maxFractionDigits="2"
                  required
                  :disabled="isSubmitting"
                  class="full-width-input"
              />
            </div>

            <div class="form-field-group">
              <label for="images-upload" class="image-upload-label">
                URL de Imagen o Subir Archivo
              </label>

              <pv-float-label>
                <pv-input-text
                    id="imagen"
                    v-model="form.imagen"
                    :disabled="isSubmitting || !!imageFile || isImageUploading"
                    placeholder="Pega una URL (si no subes archivo)"
                    class="full-width-input"
                />
                <label for="imagen">URL de Imagen (Campo 'imagen')</label>
              </pv-float-label>

              <div class="text-center my-2 text-gray-500 text-sm font-semibold">O</div>

              <input
                  type="file"
                  id="images-upload"
                  ref="fileInput"
                  accept="image/*"
                  @change="onFileSelected"
                  :disabled="isSubmitting"
                  class="file-input-style"
              />

              <small v-if="imageFile" class="p-error block mt-1">
                Archivo seleccionado: {{ imageFile.name }}. Se subirá al crear.
              </small>
              <small v-else-if="form.imagen" class="text-green-600 block mt-1">
                Usando URL manual.
              </small>
              <small v-if="isImageUploading" class="text-blue-500 block mt-1">
                <i class="pi pi-spin pi-spinner mr-2"></i>Subiendo imagen...
              </small>
            </div>

            <input type="hidden" :value="form.hotelId" name="hotelId"/>

            <div class="form-actions-group">
              <pv-button
                  type="button"
                  label="Cancelar"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  @click="goBack"
                  class="p-button-outlined"
                  :disabled="isSubmitting"
              />
              <pv-button
                  type="submit"
                  label="Crear Habitación"
                  icon="pi pi-check"
                  class="p-button-primary"
                  :loading="isSubmitting"
                  :disabled="isFormInvalid"
              />
            </div>
          </form>

        </template>
      </pv-card>

    </div>
  </div>
</template>

<style scoped>
/* Tu CSS para estilos se mantiene igual, ya que la estructura HTML es similar */
.create-page-container {
  padding: 2rem;
  min-height: 90vh;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-card-wrapper {
  width: 100%;
  max-width: 30rem;
}

.create-form-card {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  background-color: #ffffff;
}

.card-title-header {
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  font-size: 1.5rem;
  color: #343a40;
  font-weight: 600;
}

.card-title-icon {
  margin-right: 0.75rem;
  color: #28a745;
  font-size: 1.25rem;
}

.create-form-card :deep(.p-card-content) {
  padding-top: 1.5rem;
}

.create-form {
  display: grid;
  gap: 1.5rem;
}

.form-field-group {
  width: 100%;
}

.full-width-input {
  width: 100%;
}

.image-upload-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

.file-input-style {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
}

.p-error {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--p-red-500);
}

.form-actions-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.feedback-messages {
  margin-top: 0;
  margin-bottom: 1rem;
  display: grid;
  gap: 0.5rem;
}
</style>