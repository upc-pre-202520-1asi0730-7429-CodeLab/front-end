<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../application/auth.store.js";

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  username: "",
  password: ""
});

const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = "";
  authStore.clearErrors();
  isLoading.value = true;

  const success = await authStore.login({
    username: form.value.username,
    password: form.value.password
  });

  isLoading.value = false;

  if (success) {
    const redirectRoute = authStore.isAdmin ? "admin-dashboard" : "guest-hotels";
    router.push({ name: redirectRoute });
  } else {
    error.value = authStore.errors[0] || "Invalid username or password";
  }
};

const goToRegister = () => {
  router.push({ name: "register" });
};
</script>

<template>
  <div class="centered-container">
    <div class="login-card">
      <div class="text-center mb-6">
        <i class="pi pi-building text-6xl text-purple-600 mb-4"></i>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Hotel Manager</h1>
        <p class="text-gray-600">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <pv-float-label variant="on">
          <pv-input-text
              id="username"
              v-model="form.username"
              type="email"
              autocomplete="username"
              required
              class="w-full"
              :disabled="isLoading"
          />
          <label for="username">Email</label>
        </pv-float-label>

        <pv-float-label variant="on">
          <pv-input-text
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full"
              :disabled="isLoading"
          />
          <label for="password">Password</label>
        </pv-float-label>

        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle mr-2"></i>
          {{ error }}
        </div>

        <div class="flex flex-col gap-3 mt-6">
          <pv-button
              type="submit"
              label="Sign In"
              class="w-full"
              :loading="isLoading"
              icon="pi pi-sign-in"
          />
          <pv-button
              type="button"
              label="Create Account"
              severity="secondary"
              outlined
              class="w-full"
              @click="goToRegister"
              :disabled="isLoading"
              icon="pi pi-user-plus"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.centered-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #c33;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}
</style>