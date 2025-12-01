<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const router = useRouter();

// Configuración de Cloudinary
// ⚠️ IMPORTANTE: Reemplaza estos valores por los tuyos
const CLOUD_NAME = 'doekyziqa'; // Tu Cloud Name
const UPLOAD_PRESET = 'hotel_unsigned_upload'; // 👈 ¡REEMPLAZA ESTO por tu preset NO FIRMADO!

const form = ref({
  name: "",
  images: "", // Aquí se guardará la URL final de Cloudinary
  address: "",
  phone: "",
  userId: 0
});

// Referencia para almacenar el archivo de imagen seleccionado
const imageFile = ref(null);

const error = ref("");
const success = ref("");

// Comprobamos si el formulario está siendo procesado (incluye la subida de imagen)
const isSubmitting = computed(() => store.loading);

onMounted(() => {
  // 1. Obtener el userId del almacenamiento local
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

// Función que se activa cuando se selecciona un archivo
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    // Si se selecciona un archivo, limpiamos el campo de URL manual (opcional)
    form.value.images = '';
  }
};

/**
 * Sube la imagen seleccionada a Cloudinary.
 * @returns {Promise<string>} La URL segura y corta de la imagen subida.
 */
const uploadImageToCloudinary = async () => {
  if (!imageFile.value) {
    // Si no hay archivo, devolvemos lo que esté en el campo images (URL manual)
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
    return data.secure_url; // La URL corta y directa
  } catch (e) {
    console.error("Cloudinary Upload Error:", e);
    error.value = `Error al subir la imagen: ${e.message || 'Verifica el Cloud Name y el Preset.'}`;
    throw e; // Relanzamos para detener la creación del hotel
  }
};


const handleCreate = async () => {
  error.value = "";
  success.value = "";

  if (!form.value.userId) {
    error.value = "Error: El ID de usuario no está asignado.";
    return;
  }

  // 0. GESTIONAR SUBIDA DE IMAGEN
  let finalImageUrl = form.value.images;

  if (imageFile.value) {
    // Usamos el loading del store mientras se sube
    store.loading = true;
    try {
      finalImageUrl = await uploadImageToCloudinary();
    } catch (e) {
      store.loading = false;
      return; // Detener si la subida falla
    }
    store.loading = false;
  }

  // 1. CONSTRUCCIÓN FINAL: Usamos la URL obtenida (subida o manual)
  const hotelData = {
    ...form.value,
    images: finalImageUrl,
  };

  const ok = await store.createHotel(hotelData);

  if (ok) {
    success.value = "Hotel creado correctamente. Redirigiendo...";

    // Limpiar el formulario y redirigir
    form.value = {
      name: "",
      images: "",
      address: "",
      phone: "",
      userId: form.value.userId
    };
    imageFile.value = null; // Limpiar la referencia del archivo

    setTimeout(() => {
      router.push("/hotels/delete");
    }, 1500);

  } else {
    const storeError = store.errors.length > 0 ? store.errors[0] : "Error desconocido.";
    error.value = `No se pudo crear el hotel: ${storeError}`;
  }
};

const goBack = () => router.push({ name: "hotel-list" });
</script>

<template>
  <div class="create-page-container">
    <div class="form-card-wrapper">
      <pv-card class="create-form-card">

        <template #title>
          <div class="card-title-header">
            <i class="pi pi-plus-circle card-title-icon"></i>
            Añadir Nuevo Hotel
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleCreate" class="create-form">

            <div class="form-field-group">
              <pv-float-label>
                <pv-input-text id="name" v-model="form.name" required class="full-width-input" :disabled="isSubmitting" />
                <label for="name">Nombre del Hotel</label>
              </pv-float-label>
            </div>

            <div class="form-field-group">
              <label for="images-upload" class="image-upload-label">
                URL de Imagen o Subir Archivo
              </label>

              <pv-float-label>
                <pv-input-text
                    id="images"
                    v-model="form.images"
                    :disabled="isSubmitting || !!imageFile"
                    placeholder="Pega una URL (si no subes archivo)"
                    class="full-width-input"
                />
                <label for="images">URL de Imagen</label>
              </pv-float-label>

              <input
                  type="file"
                  id="images-upload"
                  accept="image/*"
                  @change="onFileSelected"
                  :disabled="isSubmitting"
                  class="file-input-style"
              />

              <small v-if="imageFile" class="p-error">
                Archivo seleccionado: {{ imageFile.name }}. Se subirá al crear.
              </small>
            </div>
            <div class="form-field-group">
              <pv-float-label>
                <pv-input-text id="address" v-model="form.address" required class="full-width-input" :disabled="isSubmitting" />
                <label for="address">Dirección</label>
              </pv-float-label>
            </div>

            <div class="form-field-group">
              <pv-float-label>
                <pv-input-text id="phone" v-model="form.phone" required class="full-width-input" :disabled="isSubmitting" />
                <label for="phone">Teléfono</label>
              </pv-float-label>
            </div>

            <input type="hidden" :value="form.userId" name="userId" />

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
                  label="Crear Hotel"
                  icon="pi pi-check"
                  class="p-button-primary"
                  :loading="isSubmitting"
                  :disabled="!form.name || !form.userId || (!form.images && !imageFile)"
              />
            </div>
          </form>

        </template>
      </pv-card>

      <div class="feedback-messages">
        <pv-message v-if="success" severity="success" :life="3000">{{ success }}</pv-message>
        <pv-message v-if="error" severity="error" :life="5000">{{ error }}</pv-message>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* -------------------------------------- */
/* CONTENEDOR PRINCIPAL Y CENTRADO */
/* -------------------------------------- */

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

/* -------------------------------------- */
/* ENCABEZADO DE LA TARJETA */
/* -------------------------------------- */

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

/* Modificamos el padding interno de la tarjeta (uso de :deep) */
.create-form-card :deep(.p-card-content) {
  padding-top: 1.5rem;
}

/* -------------------------------------- */
/* FORMULARIO Y CAMPOS */
/* -------------------------------------- */

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

/* Estilos específicos para el input de archivo */
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
  color: #dc3545; /* Color de error */
}

/* -------------------------------------- */
/* BOTONES DE ACCIÓN */
/* -------------------------------------- */

.form-actions-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* -------------------------------------- */
/* MENSAJES DE FEEDBACK */
/* -------------------------------------- */

.feedback-messages {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.5rem;
}
</style>