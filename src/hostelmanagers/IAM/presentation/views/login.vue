<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
// Ajusta la ruta a tu store de autenticación
import useAuthStore from "../../application/user.store.js";


const store = useAuthStore();
const router = useRouter();

const form = ref({
  username: "",
  password: ""
});

const error = ref("");
const isLoading = ref(false); // Controla el estado de carga

/**
 * Maneja el intento de inicio de sesión.
 */
const handleLogin = async () => {
  // 1. Resetear el estado y activar la carga
  error.value = "";
  isLoading.value = true;

  try {
    // 2. Llamada a la lógica de login
    const success = await store.login({
      username: form.value.username,
      password: form.value.password
    });

    if (success) {
      // 3. Redirección exitosa
      router.push({ name: "create-hotel" });
    } else {
      // 4. Mensaje de error si las credenciales fallan
      error.value = "Credenciales incorrectas. Verifica tu usuario y contraseña.";
    }
  } catch (err) {
    // 5. Manejo de errores de red o servidor
    console.error("Error de login:", err);
    error.value = "Error al conectar con el servidor. Intenta de nuevo más tarde.";
  } finally {
    // 6. Desactivar la carga
    isLoading.value = false;
  }
};

/**
 * Redirige al formulario de registro.
 */
const goToRegister = () => {
  router.push({ name: "register" });
};
</script>

<template>
  <div class="centered-container">
    <div class="max-w-md w-full login-card-shadow rounded-2xl">

      <pv-card>
        <template #title>
          <div class="text-center p-4">
            <i class="pi pi-building text-4xl mb-2 text-primary-600"></i>
            <h1 class="text-3xl font-bold">Login</h1>
            <p class="text-sm text-gray-500 mt-1">Accede a tu plataforma de administración</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="space-y-6">

            <div>
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-envelope"></pv-input-icon>
                  <pv-input-text
                      id="username"
                      v-model="form.username"
                      type="email"
                      autocomplete="username"
                      class="w-full"
                      :disabled="isLoading"
                      required
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
                      autocomplete="current-password"
                      class="w-full"
                      :disabled="isLoading"
                      required
                  />
                </pv-icon-field>
                <label for="password">Contraseña</label>
              </pv-float-label>
            </div>

            <pv-message v-if="error" severity="error" :closable="false" class="transition-all">{{ error }}</pv-message>

            <div class="flex flex-col md:flex-row gap-3 pt-2">
              <pv-button
                  type="submit"
                  label="Acceder"
                  icon="pi pi-sign-in"
                  :loading="isLoading"
                  :disabled="isLoading"
                  severity="info"
                  class="w-full transition-all"
              />

              <pv-button
                  type="button"
                  label="Registrarse"
                  icon="pi pi-user-plus"
                  severity="secondary"
                  outlined
                  @click="goToRegister"
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
  /* Fondo Gris muy claro y profesional */
  background-color: #f5f5f5;
  padding: 1rem;
}

.max-w-md {
  max-width: 420px;
}

/* Sombra más marcada y esquinas redondeadas para el contenedor de la tarjeta */
.login-card-shadow {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); /* Sombra elegante */
  border-radius: 1rem; /* Esquinas redondeadas (16px) */
  overflow: hidden;
}

/* Color para el ícono/título */
.text-primary-600 {
  color: green; /* Usa el color 'info' definido por tu tema PrimeVue (típicamente azul) */
}
</style>