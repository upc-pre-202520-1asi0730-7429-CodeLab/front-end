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

const handleLogin = async () => {
  error.value = "";

  const success = await store.login({
    username: form.value.username,
    password: form.value.password
  });

  if (success) {
    alert("Login successfully");
    router.push({ name: "create-hotel" });
  } else {
    error.value = "Usuario o contraseña incorrectos";
  }
};

const goToRegister = () => {
  router.push({ name: "register" });
};
</script>

<template>
  <div class="centered-container">
    <div class="p-4 max-w-md mx-auto">
      <h1 class="text-2xl font-semibold mb-4">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <pv-float-label variant="on">
          <pv-input-text
              id="username"
              v-model="form.username"
              type="email"
              autocomplete="username"
              required
          />
          <label for="username">Username</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
          />
          <label for="password">Password</label>
        </pv-float-label>

        <div class="flex items-center gap-2 mt-2">
          <pv-button type="submit" label="Login" />
          <pv-button
              type="button"
              class="ml-2"
              label="Register"
              severity="help"
              @click="goToRegister"
          />
        </div>
      </form>

      <div v-if="error" class="text-red-600 mt-3">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.centered-container {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f7f7f7;
}
</style>
