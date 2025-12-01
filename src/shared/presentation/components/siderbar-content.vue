<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../hostelmanagers/IAM/application/auth.store.js';

const authStore = useAuthStore();
const router = useRouter();

// Computed properties basadas en el store
const currentUser = computed(() => authStore.currentUser);
const isAdmin = computed(() => authStore.isAdmin);
const isClient = computed(() => authStore.isClient);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <aside class="sidebar" v-if="isAuthenticated">
    <div class="sidebar-title">
      <h3>Main Menu</h3>
      <small v-if="currentUser">
        {{ currentUser.names || currentUser.username }}
        <span class="user-role">({{ currentUser.roles }})</span>
      </small>
    </div>

    <nav>
      <ul class="menu-list">
        <!-- Admin Menu -->
        <template v-if="isAdmin">
          <li>
            <RouterLink to="/admin/dashboard" class="menu-item">
              <i class="pi pi-th-large"></i>
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/admin/hotels" class="menu-item">
              <i class="pi pi-building"></i>
              <span>My Hotels</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/admin/hotel/create" class="menu-item">
              <i class="pi pi-plus-circle"></i>
              <span>Create Hotel</span>
            </RouterLink>
          </li>
          <li class="menu-separator"></li>
          <li>
            <RouterLink to="/admin/reservations" class="menu-item">
              <i class="pi pi-calendar"></i>
              <span>Reservations</span>
            </RouterLink>
          </li>
        </template>

        <!-- Client Menu -->
        <template v-if="isClient">
          <li>
            <RouterLink to="/guest/hotels" class="menu-item">
              <i class="pi pi-search"></i>
              <span>Browse Hotels</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/guest/reservations" class="menu-item">
              <i class="pi pi-calendar"></i>
              <span>My Reservations</span>
            </RouterLink>
          </li>
        </template>

        <!-- Common Menu Items -->
        <template v-if="isAuthenticated">
          <li class="menu-separator"></li>
          <li>
            <a href="#" @click.prevent="handleLogout" class="menu-item logout">
              <i class="pi pi-sign-out"></i>
              <span>Logout</span>
            </a>
          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.1);
}

.sidebar-title h3 {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-title small {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  display: block;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.menu-list {
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
}

.menu-list li {
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  font-weight: 500;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-left-color: #ffffff;
  padding-left: 1.5rem;
}

.menu-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-left-color: #ffffff;
  font-weight: 600;
}

.menu-item i {
  margin-right: 0.875rem;
  width: 1.25rem;
  font-size: 1.1rem;
}

.menu-item span {
  flex: 1;
}

.menu-item.logout:hover {
  background-color: rgba(220, 53, 69, 0.2);
  color: #ff6b6b;
  border-left-color: #ff6b6b;
}

.menu-separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.15);
  margin: 0.75rem 1rem;
}
</style>