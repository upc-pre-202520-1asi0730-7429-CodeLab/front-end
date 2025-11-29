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
  roles: "Client"      // valor por defecto
});

const error = ref("");

const rolesOptions = [
  { label: "Admin", value: "Admin" },
  { label: "Client", value: "Client" }
];

const handleRegister = async () => {
  error.value = "";

  const success = await store.register({ ...form.value });

  if (success) {
    alert("Register successfully");
    router.push({ name: "login" });
  } else {
    error.value = "No se pudo registrar el usuario";
  }
};

const goToLogin = () => router.push({ name: "login" });
</script>

<template>
  <div class="centered-container">
    <div class="p-4 max-w-md mx-auto">
      <h1 class="text-2xl font-semibold mb-4">Register</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <pv-float-label variant="on">
          <pv-input-text id="names" v-model="form.names" required />
          <label for="names">Names</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text id="username" v-model="form.username" required />
          <label for="username">Username</label>
        </pv-float-label> <br/>

        <pv-float-label variant="on">
          <pv-input-text
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
          />
          <label for="password">Password</label>
        </pv-float-label> <br/>

        <div class="mt-3">
          <span class="block mb-1 text-sm font-medium">Role</span>
          <pv-select-button
              v-model="form.roles"
              :options="rolesOptions"
              optionLabel="label"
              optionValue="value"
          />
        </div> <br/>

        <div class="flex items-center gap-2 mt-4">
          <pv-button type="submit" label="Register" />
          <pv-button
              type="button"
              class="ml-2"
              label="Login"
              severity="help"
              @click="goToLogin"
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
