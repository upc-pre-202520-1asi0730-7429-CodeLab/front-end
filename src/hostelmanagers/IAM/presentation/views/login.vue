<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useAuthStore from "../../application/user.store.js";

const store = useAuthStore();
const router = useRouter();

const form = ref({
  username: "",
  password: ""
});

const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = "";
  isLoading.value = true;

  try {
    const success = await store.login({
      username: form.value.username,
      password: form.value.password
    });

    if (success) {
      router.push("/sidebar");
    } else {
      error.value = "Credenciales incorrectas. Verifica tu usuario y contraseña.";
    }
  } catch (err) {
    console.error("Error de login:", err);
    error.value = "Error al conectar con el servidor. Intenta de nuevo más tarde.";
  } finally {
    isLoading.value = false;
  }
};

const goToRegister = () => {
  router.push({ name: "register" });
};
</script>

<template>
  <div class="login-container">
    <div class="background-animation"></div>

    <div class="login-wrapper">
      <pv-card class="login-card">
        <template #title>
          <div class="card-header">
            <div class="icon-wrapper">
              <i class="pi pi-building"></i>
            </div>
            <h1 class="title">Bienvenido</h1>
            <p class="subtitle">Gestión Hotelera Premium</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-envelope"></pv-input-icon>
                  <pv-input-text
                      id="username"
                      v-model="form.username"
                      type="email"
                      autocomplete="username"
                      class="input-field"
                      :disabled="isLoading"
                      required
                  />
                </pv-icon-field>
                <label for="username">Email</label>
              </pv-float-label>
            </div>

            <div class="form-group">
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-lock"></pv-input-icon>
                  <pv-input-text
                      id="password"
                      v-model="form.password"
                      type="password"
                      autocomplete="current-password"
                      class="input-field"
                      :disabled="isLoading"
                      required
                  />
                </pv-icon-field>
                <label for="password">Contraseña</label>
              </pv-float-label>
            </div>

            <pv-message v-if="error" severity="error" :closable="false" class="error-message">
              {{ error }}
            </pv-message>

            <div class="button-group">
              <pv-button
                  type="submit"
                  label="Acceder"
                  icon="pi pi-sign-in"
                  :loading="isLoading"
                  :disabled="isLoading"
                  severity="info"
                  class="btn-primary"
              />

              <pv-button
                  type="button"
                  label="Registrarse"
                  icon="pi pi-user-plus"
                  severity="secondary"
                  outlined
                  @click="goToRegister"
                  :disabled="isLoading"
                  class="btn-secondary"
              />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(-45deg, #1e3a8a, #3b82f6, #60a5fa, #93c5fd);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 6s ease-in-out infinite;
}

.login-wrapper {
  max-width: 440px;
  width: 100%;
  animation: fadeInUp 0.6s ease-out;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow:
      0 30px 60px -12px rgba(0, 0, 0, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.card-header {
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  margin: -1.5rem -1.5rem 1.5rem;
  color: white;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.icon-wrapper i {
  font-size: 2.5rem;
  color: white;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.login-form {
  padding: 0.5rem 0;
}

.form-group {
  margin-bottom: 1.75rem;
}

.input-field {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  animation: fadeInUp 0.3s ease-out;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .title {
    font-size: 1.5rem;
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .icon-wrapper i {
    font-size: 2rem;
  }
}
</style>