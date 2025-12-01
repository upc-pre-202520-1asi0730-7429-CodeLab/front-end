<script setup>
import TheHeader from './header-content.vue'
import TheFooter from './footer-content.vue'
import TheSidebar from './siderbar-content.vue'
import { computed } from 'vue'
import useAuthStore from "../../../hostelmanagers/IAM/application/auth.store.js";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <div class="layout">
    <the-header />
    <div class="main-content">
      <the-sidebar v-if="isAuthenticated" />
      <main class="content">
        <router-view />
      </main>
    </div>
    <the-footer />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  width: 100%;
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>