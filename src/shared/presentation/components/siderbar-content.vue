<template>
  <div class="layout-con-sidebar">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <i class="pi pi-building"></i>
        </div>
        <div class="brand-info">
          <h3 class="brand-title">Hotel Manager</h3>
          <small v-if="userStore.currentUser" class="user-info">
            <i class="pi pi-user"></i>
            {{ userStore.currentUser.username }}
            <span v-if="isLoadingData" class="loading-badge">
              <i class="pi pi-spin pi-spinner"></i>
            </span>
          </small>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul class="menu-list" v-if="!isLoadingData || !userStore.currentUser">
          <template v-if="userStore.currentUser">

            <li v-if="hasManagementAccess" class="menu-section">
              <span class="section-title">
                <i class="pi pi-briefcase"></i>
                Gestión
              </span>
            </li>

            <li v-if="hasManagementAccess">
              <RouterLink to="/hotels" class="menu-item">
                <i class="pi pi-building"></i>
                <span>Mis Hoteles</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li v-if="hasManagementAccess">
              <RouterLink to="/rooms" class="menu-item">
                <i class="pi pi-home"></i>
                <span>Mis Habitaciones</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li v-if="hasManagementAccess">
              <RouterLink to="/reservations/admin" class="menu-item">
                <i class="pi pi-calendar"></i>
                <span>Reservas</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li v-if="isClientRole" class="menu-section">
              <span class="section-title">
                <i class="pi pi-compass"></i>
                Explorar
              </span>
            </li>

            <li v-if="isClientRole">
              <RouterLink to="/hotels_user" class="menu-item">
                <i class="pi pi-search"></i>
                <span>Buscar Hoteles</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li v-if="isClientRole">
              <RouterLink to="/reservations" class="menu-item">
                <i class="pi pi-calendar-plus"></i>
                <span>Mis Reservas</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li class="menu-divider"></li>

            <li v-if="!isClientRole" class="menu-section">
              <span class="section-title">
                <i class="pi pi-cog"></i>
                Configuración
              </span>
            </li>

            <li v-if="!isClientRole">
              <RouterLink to="/subscriptions" class="menu-item">
                <i class="pi pi-credit-card"></i>
                <span>Mi Suscripción</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li v-if="!hasManagementAccess && !isClientRole && !isLoadingData" class="subscription-alert">
              <div class="alert-content">
                <i class="pi pi-exclamation-triangle"></i>
                <span>Crea tu suscripción para acceder a los módulos de gestión</span>
              </div>
            </li>

            <li v-if="!isClientRole">
              <RouterLink to="/profile" class="menu-item">
                <i class="pi pi-user"></i>
                <span>Mi Perfil</span>
                <i class="pi pi-angle-right arrow"></i>
              </RouterLink>
            </li>

            <li class="menu-divider"></li>

            <li>
              <a href="#" @click.prevent="handleLogout" class="menu-item logout-item">
                <i class="pi pi-sign-out"></i>
                <span>Cerrar Sesión</span>
                <i class="pi pi-angle-right arrow"></i>
              </a>
            </li>
          </template>
        </ul>

        <div v-if="isLoadingData && userStore.currentUser" class="loading-overlay">
          <div class="loading-content">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Verificando acceso...</p>
          </div>
        </div>
      </nav>
    </aside>

    <main class="content-wrapper">
      <RouterView/>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import useUserStore from '../../../hostelmanagers/IAM/application/user.store.js';
import {SuscriptionsApi} from "../../../hostelmanagers/Subscription/Infrastructure/subscription-api.js";
import {UsersApi} from "../../../hostelmanagers/IAM/infrastructure/user-api.js";

const userStore = useUserStore();
const usersApi = new UsersApi();
const suscriptionsApi = new SuscriptionsApi();

const isLoadingData = ref(true);
const hasActiveSuscription = ref(false);

const fetchAndSetUserRole = async (userId) => {
  try {
    const response = await usersApi.getUserRoleById(userId);
    const role = response.data.role;

    if (role) {
      userStore.currentUser = {...userStore.currentUser, role};
      localStorage.setItem('currentUser', JSON.stringify(userStore.currentUser));
    }
  } catch (error) {
    console.error('Error al obtener el rol del usuario:', error);
  }
};

const checkUserSuscription = async (userId) => {
  try {
    const response = await suscriptionsApi.getAllSuscriptions();
    const allSuscriptions = Array.isArray(response.data) ? response.data : [];
    const found = allSuscriptions.find(s => String(s.userId) === String(userId));

    hasActiveSuscription.value = !!found;

    if (!found) {
      console.warn(`[Suscripción] No se encontró ninguna suscripción asociada al usuario ${userId}.`);
    } else {
      console.log(`[Suscripción] Suscripción activa encontrada para el usuario ${userId}.`);
    }
  } catch (error) {
    console.error('Error al obtener la lista completa de suscripciones:', error);
    hasActiveSuscription.value = false;
  }
};

onMounted(async () => {
  isLoadingData.value = true;
  const userJson = localStorage.getItem('currentUser');

  if (userJson) {
    try {
      const userData = JSON.parse(userJson);

      if (!userStore.currentUser) {
        userStore.currentUser = userData;
      }

      const user = userStore.currentUser;

      if (user && user.id) {
        if (!user.role) {
          await fetchAndSetUserRole(user.id);
        }

        if (user.role !== 'Client') {
          await checkUserSuscription(user.id);
        }
      }
    } catch (e) {
      console.error('Error al iniciar el usuario:', e);
      localStorage.removeItem('currentUser');
    }
  }

  isLoadingData.value = false;
});

const isClientRole = computed(() => {
  return userStore.currentUser?.role === 'Client';
});

const hasManagementAccess = computed(() => {
  if (isLoadingData.value) return false;
  if (isClientRole.value) {
    return false;
  }
  return hasActiveSuscription.value;
});

const handleLogout = () => {
  userStore.logout();
  window.location.href = '/';
};
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.layout-con-sidebar {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 280px;
  min-height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  animation: slideIn 0.4s ease-out;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
}

.logo-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.logo-wrapper i {
  font-size: 1.75rem;
  color: white;
}

.brand-info {
  color: white;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  color: white;
  letter-spacing: -0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.user-info i {
  font-size: 0.75rem;
}

.loading-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
}

.loading-badge i {
  animation: pulse 1.5s ease-in-out infinite;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-section {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
}

.section-title i {
  font-size: 0.875rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: white;
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-item.router-link-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%);
  color: white;
  font-weight: 600;
}

.menu-item.router-link-active::before {
  transform: scaleY(1);
}

.menu-item i:first-child {
  width: 1.25rem;
  font-size: 1.125rem;
  text-align: center;
}

.menu-item span {
  flex: 1;
}

.menu-item .arrow {
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.menu-item:hover .arrow {
  opacity: 1;
  transform: translateX(0);
}

.logout-item {
  color: rgba(239, 68, 68, 0.8);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.logout-item:hover::before {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 1.5rem;
}

.subscription-alert {
  margin: 1rem 1.5rem;
  animation: fadeIn 0.5s ease-out;
}

.alert-content {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-content i {
  color: #f87171;
  font-size: 1.125rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-content span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  line-height: 1.4;
  font-weight: 500;
}

.loading-overlay {
  padding: 2rem;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-content i {
  font-size: 2rem;
  color: #3b82f6;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}

@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }

  .sidebar-header {
    padding: 1.5rem 1rem;
  }

  .logo-wrapper {
    width: 50px;
    height: 50px;
  }

  .brand-title {
    font-size: 1.25rem;
  }

  .menu-item {
    padding: 0.75rem 1rem;
  }
}
</style>