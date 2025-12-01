<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useRegisterStore from "../../application/register.store.js";

const store = useRegisterStore();
const router = useRouter();

const form = ref({
  username: "",
  password: "",
  names: "",
  roles: "Client" // valor por defecto
});

const error = ref("");
const isLoading = ref(false);

const rolesOptions = [
  {label: "Admin", value: "Admin"},
  {label: "Client", value: "Client"}
];

// Función para validar el formato básico del correo
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

/**
 * Maneja el intento de registro.
 */
const handleRegister = async () => {
  error.value = "";

  // 🚨 VALIDACIÓN MANUAL DEL CORREO
  if (!validateEmail(form.value.username)) {
    error.value = "Por favor, introduce un correo electrónico válido (debe contener el símbolo '@').";
    return;
  }

  isLoading.value = true; // Empezar carga

  try {
    const success = await store.register({...form.value});

    if (success) {
      router.push({name: "login"});
    } else {
      error.value = "No se pudo registrar el usuario. Es posible que el correo ya esté en uso.";
    }
  } catch (err) {
    console.error("Error de registro:", err);
    error.value = "Error al conectar con el servidor. Intenta de nuevo más tarde.";
  } finally {
    isLoading.value = false; // Finalizar carga
  }
};

const goToLogin = () => router.push({name: "login"});
</script>

<template>
  <div class="centered-container">
    <div class="max-w-md w-full login-card-shadow rounded-2xl">

      <pv-card>
        <template #title>
          <div class="text-center p-4">
            <i class="pi pi-user-plus text-4xl mb-2 text-primary-600"></i>
            <h1 class="text-3xl font-bold">Registro de Usuario</h1>
            <p class="text-sm text-gray-500 mt-1">Crea tu cuenta para acceder a la plataforma</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleRegister" class="space-y-2">

            <div>
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-user"></pv-input-icon>
                  <pv-input-text
                      id="names"
                      v-model="form.names"
                      class="w-full"
                      :disabled="isLoading"
                      required
                      autocomplete="off"
                  />
                </pv-icon-field>
                <label for="names">Nombres Completos</label>
              </pv-float-label>
            </div>

            <div>
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-envelope"></pv-input-icon>
                  <pv-input-text
                      id="username"
                      v-model="form.username"
                      type="email"
                      class="w-full"
                      :disabled="isLoading"
                      required
                      autocomplete="off"
                  />
                </pv-icon-field>
                <label for="username">Email</label>
              </pv-float-label>
            </div>

            <div>
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-lock"></pv-input-icon>
                  <pv-input-text
                      id="password"
                      v-model="form.password"
                      type="password"
                      class="w-full"
                      :disabled="isLoading"
                      required
                      autocomplete="off"
                  />
                </pv-icon-field>
                <label for="password">Contraseña</label>
              </pv-float-label>
            </div>

            <div class="mt-3">
              <span class="block mb-2 text-sm font-medium text-gray-700">Selecciona tu Rol</span>
              <pv-select-button
                  v-model="form.roles"
                  :options="rolesOptions"
                  optionLabel="label"
                  optionValue="value"
                  :disabled="isLoading"
                  class="w-full"
              />
            </div>

            <pv-message v-if="error" severity="error" :closable="false" class="transition-all">{{ error }}</pv-message>

            <div class="flex flex-col md:flex-row gap-3 pt-2">
              <pv-button
                  type="submit"
                  label="Registrarse"
                  icon="pi pi-user-plus"
                  :loading="isLoading"
                  :disabled="isLoading"
                  severity="success"
                  class="w-full transition-all"
              />

              <pv-button
                  type="button"
                  label="Volver al Login"
                  icon="pi pi-sign-in"
                  severity="secondary"
                  outlined
                  @click="goToLogin"
                  :disabled="isLoading"
                  class="w-full transition-all"
              />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor Centrado con Fondo Gris Sutil */
.centered-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.max-w-md {
  max-width: 420px;
}

/* Sombra más marcada y esquinas redondeadas para la tarjeta */
.login-card-shadow {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
  overflow: hidden;
}

/* Color para el ícono/título (usando el color 'success' de PrimeVue) */
.text-primary-600 {
  color:green;
}
</style>