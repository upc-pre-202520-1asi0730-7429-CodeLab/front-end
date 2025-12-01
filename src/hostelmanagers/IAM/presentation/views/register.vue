<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../application/auth.store.js";

const authStore = useAuthStore();
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
  { label: "Hotel Admin", value: "Admin" },
  { label: "Guest", value: "Client" }
];

const handleRegister = async () => {
  error.value = "";
  authStore.clearErrors();
  isLoading.value = true;

  const success = await authStore.register({ ...form.value });

  isLoading.value = false;

  if (success) {
    alert("Registration successful! Please login.");
    router.push({ name: "login" });
  } else {
    error.value = authStore.errors[0] || "Registration failed";
  }
};

const goToLogin = () => router.push({ name: "login" });
</script>

<template>
  <div class="centered-container">
    <div class="register-card">
      <div class="text-center mb-6">
        <i class="pi pi-user-plus text-6xl text-purple-600 mb-4"></i>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
        <p class="text-gray-600">Join Hotel Manager today</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <pv-float-label variant="on">
          <pv-input-text id="names" v-model="form.names" required class="w-full" :disabled="isLoading" />
          <label for="names">Full Name</label>
        </pv-float-label>

        <pv-float-label variant="on">
          <pv-input-text id="username" v-model="form.username" type="email" required class="w-full" :disabled="isLoading" />
          <label for="username">Email</label>
        </pv-float-label>

        <pv-float-label variant="on">
          <pv-input-text
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full"
              :disabled="isLoading"
          />
          <label for="password">Password</label>
        </pv-float-label>

        <div class="role-selection">
          <label class="block mb-2 text-sm font-medium text-gray-700">Account Type</label>
          <pv-select-button
              v-model="form.roles"
              :options="rolesOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :disabled="isLoading"
          />
          <p class="text-xs text-gray-500 mt-2">
            <strong>Admin:</strong> Manage your hotels and rooms<br>
            <strong>Guest:</strong> Book and manage reservations
          </p>
        </div>

        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle mr-2"></i>
          {{ error }}
        </div>

        <div class="flex flex-col gap-3 mt-6">
          <pv-button
              type="submit"
              label="Create Account"
              class="w-full"
              :loading="isLoading"
              icon="pi pi-check"
          />
          <pv-button
              type="button"
              label="Already have an account? Sign In"
              severity="secondary"
              text
              class="w-full"
              @click="goToLogin"
              :disabled="isLoading"
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

.register-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
}

.role-selection {
  margin-top: 1rem;
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