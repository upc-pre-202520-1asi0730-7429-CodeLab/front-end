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
  roles: "Client"
});

const error = ref("");
const isLoading = ref(false);

const rolesOptions = [
  {label: "Admin", value: "Admin"},
  {label: "Client", value: "Client"}
];

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const handleRegister = async () => {
  error.value = "";

  if (!validateEmail(form.value.username)) {
    error.value = "Por favor, introduce un correo electrónico válido (debe contener el símbolo '@').";
    return;
  }

  isLoading.value = true;

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
    isLoading.value = false;
  }
};

const goToLogin = () => router.push({name: "login"});
</script>

<template>
  <div class="register-container">
    <div class="background-animation"></div>

    <div class="register-wrapper">
      <pv-card class="register-card">
        <template #title>
          <div class="card-header">
            <div class="icon-wrapper">
              <i class="pi pi-user-plus"></i>
            </div>
            <h1 class="title">Crear Cuenta</h1>
            <p class="subtitle">Únete a nuestra plataforma hotelera</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-user"></pv-input-icon>
                  <pv-input-text
                      id="names"
                      v-model="form.names"
                      class="input-field"
                      :disabled="isLoading"
                      required
                      autocomplete="off"
                  />
                </pv-icon-field>
                <label for="names">Nombres Completos</label>
              </pv-float-label>
            </div>

            <div class="form-group">
              <pv-float-label>
                <pv-icon-field iconPosition="left">
                  <pv-input-icon class="pi pi-envelope"></pv-input-icon>
                  <pv-input-text
                      id="username"
                      v-model="form.username"
                      type="email"
                      class="input-field"
                      :disabled="isLoading"
                      required
                      autocomplete="off"
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
                      class="input-field"
                      :disabled="isLoading"
                      required
                      autocomplete="off"
                  />
                </pv-icon-field>
                <label for="password">Contraseña</label>
              </pv-float-label>
            </div>

            <div class="role-selector">
              <label class="role-label">Selecciona tu Rol</label>
              <pv-select-button
                  v-model="form.roles"
                  :options="rolesOptions"
                  optionLabel="label"
                  optionValue="value"
                  :disabled="isLoading"
                  class="role-buttons"
              />
            </div>

            <pv-message v-if="error" severity="error" :closable="false" class="error-message">
              {{ error }}
            </pv-message>

            <div class="button-group">
              <pv-button
                  type="submit"
                  label="Registrarse"
                  icon="pi pi-user-plus"
                  :loading="isLoading"
                  :disabled="isLoading"
                  severity="success"
                  class="btn-primary"
              />

              <pv-button
                  type="button"
                  label="Volver al Login"
                  icon="pi pi-sign-in"
                  severity="secondary"
                  outlined
                  @click="goToLogin"
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

.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(-45deg, #047857, #059669, #10b981, #34d399);
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

.register-wrapper {
  max-width: 440px;
  width: 100%;
  animation: fadeInUp 0.6s ease-out;
  z-index: 1;
}

.register-card {
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

.register-card:hover {
  box-shadow:
      0 30px 60px -12px rgba(0, 0, 0, 0.35),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.card-header {
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
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

.register-form {
  padding: 0.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-field {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.input-field:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.role-selector {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%);
  border-radius: 12px;
}

.role-label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #047857;
}

.role-buttons {
  width: 100%;
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
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.btn-secondary {
  border: 2px solid #10b981;
  color: #10b981;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.05);
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