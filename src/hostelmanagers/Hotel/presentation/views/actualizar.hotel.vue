<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useHotelStore from "../../application/hotel.store.js";

const store = useHotelStore();
const route = useRoute();
const router = useRouter();

// Configuración de Cloudinary (solo el Cloud Name es seguro en el frontend)
const CLOUD_NAME = 'doekyziqa'; // Obtenido de tu CLOUDINARY_URL
const UPLOAD_PRESET = 'hotel_unsigned_upload'; // 👈 ¡REEMPLAZA ESTO!

const form = ref({
  id: null,
  name: "",
  images: "",
  address: "",
  phone: "",
  userId: 0
});

// Referencia para almacenar el archivo de imagen seleccionado por el usuario
const imageFile = ref(null);
const loading = ref(true);
const error = ref("");
const success = ref("");

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    await store.fetchHotelById(id);

    if (store.currentHotel) {
      form.value = { ...store.currentHotel };
    } else {
      error.value = "Hotel no encontrado. Verifique el ID.";
    }
  } catch (err) {
    error.value = "Error al cargar los datos del hotel.";
  } finally {
    loading.value = false;
  }
});

// Función que se activa cuando se selecciona un archivo
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    // Opcional: limpiar la URL existente si se selecciona un archivo
    // form.value.images = '';
  }
};

/**
 * Sube la imagen seleccionada a Cloudinary.
 * @returns {Promise<string>} La URL segura y corta de la imagen subida.
 */
const uploadImageToCloudinary = async () => {
  if (!imageFile.value) {
    // Si no hay archivo nuevo, devuelve la URL existente
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
    return data.secure_url; // Esta es la URL corta y directa al recurso
  } catch (e) {
    console.error("Cloudinary Upload Error:", e);
    // Establecemos un mensaje de error para el usuario
    error.value = `Error al subir la imagen: ${e.message || 'Verifica el Cloud Name y el Preset.'}`;
    throw e; // Relanzamos para detener la actualización del hotel
  }
};


const handleUpdate = async () => {
  error.value = "";
  success.value = "";

  // 0. GESTIONAR SUBIDA DE IMAGEN
  const hotelIdForUrl = form.value.id;
  let finalImageUrl = form.value.images;

  // Si se seleccionó un nuevo archivo, lo subimos
  if (imageFile.value) {
    // Usamos el loading del store mientras se sube y actualiza
    store.loading = true;
    try {
      finalImageUrl = await uploadImageToCloudinary();
    } catch (e) {
      store.loading = false;
      return; // Detener si la subida falla
    }
    store.loading = false;
  }

  // 1. CONSTRUCCIÓN DEL BODY: Usando la URL obtenida (nueva o existente)
  const dataToUpdate = {
    id: hotelIdForUrl,
    name: form.value.name,
    images: finalImageUrl, // 👈 Usamos la URL corta y funcional
    address: form.value.address,
    phone: form.value.phone,
    userId: form.value.userId
  };

  console.log("Cuerpo enviado (Body):", dataToUpdate);

  // 2. LLAMADA AL STORE
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
  <div class="update-page-container">
    <div class="form-card-wrapper">

      <pv-card class="update-form-card">
        <template #title>
          <div class="card-title-header">
            <i class="pi pi-pencil card-title-icon"></i>
            Actualizar Hotel
          </div>
        </template>

        <template #content>

          <div v-if="loading || store.loading" class="skeleton-loader-group">
            <pv-skeleton height="2.5rem"></pv-skeleton>
            <pv-skeleton height="2.5rem"></pv-skeleton>
            <pv-skeleton height="2.5rem"></pv-skeleton>
            <pv-skeleton height="2.5rem"></pv-skeleton>
            <pv-skeleton height="2.5rem" width="50%" class="skeleton-button"></pv-skeleton>
          </div>

          <form v-else @submit.prevent="handleUpdate" class="update-form">

            <div class="form-field-group">
              <pv-float-label>
                <pv-input-text id="name" v-model="form.name" required class="full-width-input" />
                <label for="name">Nombre</label>
              </pv-float-label>
            </div>

            <div class="form-field-group">
              <label for="images-upload" class="image-upload-label">
                URL de Imagen Actual o Subir Nueva
              </label>

              <pv-input-text
                  id="images"
                  v-model="form.images"
                  :disabled="!!imageFile"
                  :placeholder="imageFile ? 'Nueva imagen lista para subir' : 'Pega una URL larga o sube un archivo'"
                  class="full-width-input"
              />

              <input
                  type="file"
                  id="images-upload"
                  accept="image/*"
                  @change="onFileSelected"
                  class="file-input-style"
              />

              <small v-if="imageFile" class="p-error">
                Archivo seleccionado: {{ imageFile.name }}. Se subirá al guardar.
              </small>
            </div>
            <div class="form-field-group">
              <pv-float-label>
                <pv-input-text id="address" v-model="form.address" required class="full-width-input" />
                <label for="address">Dirección</label>
              </pv-float-label>
            </div>

            <div class="form-field-group">
              <pv-float-label>
                <pv-input-text id="phone" v-model="form.phone" required class="full-width-input" />
                <label for="phone">Teléfono</label>
              </pv-float-label>
            </div>

            <div class="form-actions-group">
              <pv-button
                  type="button"
                  label="Regresar"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  @click="goBack"
                  class="p-button-outlined"
              />
              <pv-button
                  type="submit"
                  label="Guardar Cambios"
                  icon="pi pi-check"
                  class="p-button-primary"
                  :loading="store.loading"
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
/* Estilos sin variables CSS, usando valores fijos. */

.update-page-container {
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
}

.form-card-wrapper {
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
}

.update-form-card {
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
  color: #007bff;
  font-size: 1.25rem;
}

.update-form-card :deep(.p-card-content) {
  padding-top: 1rem;
}

.skeleton-loader-group {
  display: grid;
  gap: 1.5rem;
}

.skeleton-button {
  margin-top: 0.5rem;
  justify-self: end;
}

.update-form {
  display: grid;
  gap: 1.5rem;
}

.form-field-group {
  width: 100%;
}

.full-width-input {
  width: 100%;
}

/* Estilos específicos para el nuevo input de archivo */
.image-upload-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem; /* Pequeño */
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
}


.form-actions-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.feedback-messages {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.5rem;
}
</style>