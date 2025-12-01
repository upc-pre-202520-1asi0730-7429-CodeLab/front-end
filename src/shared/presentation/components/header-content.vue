<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../hostelmanagers/IAM/application/auth.store.js';

const authStore = useAuthStore();
const router = useRouter();

const currentUser = computed(() => authStore.currentUser);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <i class="pi pi-building"></i>
        <span>Hotel Manager</span>
      </div>

      <div v-if="isAuthenticated" class="user-info">
        <span class="username">{{ currentUser?.names || currentUser?.username }}</span>
        <pv-button
            icon="pi pi-sign-out"
            rounded
            text
            severity="danger"
            @click="handleLogout"
            title="Logout"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo i {
  font-size: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: white;
  font-weight: 500;
}
</style>