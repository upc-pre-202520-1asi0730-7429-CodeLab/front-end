<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { RouterView } from 'vue-router'; // Importar RouterView explícitamente
import useUserStore from '../../../hostelmanagers/IAM/application/user.store.js';

const userStore = useUserStore();

// Inicializar el store desde localStorage al montar
onMounted(() => {
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      if (!userStore.currentUser) {
        userStore.currentUser = userData;
      }
    } catch (e) {
      console.error('Error al parsear usuario:', e);
      localStorage.removeItem('currentUser');
    }
  }
});

const handleLogout = () => {
  userStore.logout();
  window.location.href = '/';
};
</script>

<template>
  <div class="layout-con-sidebar">

    <aside class="sidebar">
      <div class="sidebar-title">
        <h3>Menú Principal</h3>
        <small v-if="userStore.currentUser">
          Usuario: {{ userStore.currentUser.username }}
        </small>
      </div>

      <nav>
        <ul class="menu-list">
          <template v-if="userStore.currentUser">

            <li>
              <RouterLink to="/hotels" class="menu-item">
                <i class="pi pi-building"></i>
                <span>Mis Hoteles / Buscar Hoteles</span>
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/rooms" class="menu-item">
                <i class="pi pi-home"></i>
                <span>Mis Habitaciones</span>
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/reservations" class="menu-item">
                <i class="pi pi-calendar"></i>
                <span>Reservas</span>
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/subscriptions" class="menu-item">
                <i class="pi pi-credit-card"></i>
                <span>Mi Suscripción</span>
              </RouterLink>
            </li>

            <li class="menu-separator"></li>

            <li>
              <RouterLink to="/profile" class="menu-item">
                <i class="pi pi-user"></i>
                <span>Mi Perfil</span>
              </RouterLink>
            </li>
            <li>
              <a href="#" @click.prevent="handleLogout" class="menu-item logout">
                <i class="pi pi-sign-out"></i>
                <span>Cerrar Sesión</span>
              </a>
            </li>
          </template>
        </ul>
      </nav>
    </aside>

    <main class="content-wrapper">
      <RouterView /> </main>

  </div>
</template>

<style scoped>
/* 🛑 ESTILOS NUEVOS PARA EL LAYOUT (Horizontal) */
.layout-con-sidebar {
  display: flex; /* Habilita la disposición horizontal */
  width: 100%;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 0;
  flex-shrink: 0; /* Evita que el sidebar se comprima */
}

.content-wrapper {
  flex-grow: 1; /* Permite que el contenido ocupe el resto del espacio */
  padding: 20px;
  overflow-y: auto; /* Permite desplazamiento si el contenido es largo */
}

/* Estilos existentes para el menú del sidebar (mantenerlos) */
.sidebar-title {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #e9ecef;
}

.sidebar-title h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.sidebar-title small {
  color: #6c757d;
  font-size: 0.8rem;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #007bff;
  border-left-color: #007bff;
}

.menu-item.router-link-active {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left-color: #1976d2;
  font-weight: 500;
}

.menu-item i {
  margin-right: 0.75rem;
  width: 1rem;
  font-size: 1rem;
}

.menu-item span {
  flex: 1;
}

.menu-item.logout:hover {
  background-color: #f8d7da;
  color: #721c24;
  border-left-color: #dc3545;
}

.menu-separator {
  height: 1px;
  background-color: #dee2e6;
  margin: 0.5rem 0;
}
</style>