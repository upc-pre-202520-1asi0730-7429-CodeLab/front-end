<template>
  <div class="layout-con-sidebar">

    <aside class="sidebar">
      <div class="sidebar-title">
        <h3>Menú Principal</h3>
        <small v-if="userStore.currentUser">
          Usuario: **{{ userStore.currentUser.username }}**
          <span v-if="isLoadingData" style="font-style: italic;"> (Verificando acceso...)</span>
        </small>
      </div>

      <nav>
        <ul class="menu-list" v-if="!isLoadingData || !userStore.currentUser">
          <template v-if="userStore.currentUser">

            <li v-if="hasManagementAccess">
              <RouterLink to="/hotels" class="menu-item">
                <i class="pi pi-building"></i>
                <span>Mis Hoteles</span>
              </RouterLink>
            </li>

            <li v-if="isClientRole">
              <RouterLink to="/hotels_user" class="menu-item">
                <i class="pi pi-building"></i>
                <span>Buscar y Ver Hoteles</span>
              </RouterLink>
            </li>

            <li v-if="hasManagementAccess">
              <RouterLink to="/rooms" class="menu-item">
                <i class="pi pi-home"></i>
                <span>Mis Habitaciones</span>
              </RouterLink>
            </li>           

            <li v-if="hasManagementAccess">
              <RouterLink to="/reservations" class="menu-item">
                <i class="pi pi-calendar"></i>
                <span>Reservas</span>
              </RouterLink>
            </li>

            <li v-if="isClientRole">
              <RouterLink to="/reservations" class="menu-item">
                <i class="pi pi-calendar"></i>
                <span>Ver Reservas</span>
              </RouterLink>
            </li>

            <li class="menu-separator"></li>

            <li v-if="!isClientRole">
              <RouterLink to="/subscriptions" class="menu-item">
                <i class="pi pi-credit-card"></i>
                <span>Mi Suscripción</span>
              </RouterLink>
            </li>

            <li v-if="!hasManagementAccess && !isClientRole && !isLoadingData">
                <span style="display: block; padding: 10px; font-size: 0.75rem; color: #dc3545; text-align: center;">
                    Crea tu suscripción para acceder a los módulos de gestión.
                </span>
            </li>


            <li class="menu-separator"></li>

            <li v-if="!isClientRole">
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

        <div v-if="isLoadingData && userStore.currentUser" style="text-align: center; padding: 20px;">
          Verificando acceso...
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
// ⚠️ AJUSTA ESTAS RUTAS DE IMPORTACIÓN A TU ESTRUCTURA REAL
import useUserStore from '../../../hostelmanagers/IAM/application/user.store.js';
import {SuscriptionsApi} from "../../../hostelmanagers/Subscription/Infrastructure/subscription-api.js";
import {UsersApi} from "../../../hostelmanagers/IAM/infrastructure/user-api.js";

const userStore = useUserStore();
const usersApi = new UsersApi();
const suscriptionsApi = new SuscriptionsApi();

const isLoadingData = ref(true);
const hasActiveSuscription = ref(false);

// --- 1. Lógica de Obtención de Datos ---

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

/**
 * Verifica la suscripción del usuario.
 */
const checkUserSuscription = async (userId) => {
  try {
    const response = await suscriptionsApi.getAllSuscriptions();
    const allSuscriptions = Array.isArray(response.data) ? response.data : [];

    // Aseguramos que ambos userId sean tratados como strings para la comparación.
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

// --- 2. Ciclo de Vida ---

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

        // Solo verificamos la suscripción si no es Cliente
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

// --- 3. Propiedades Computadas para la Validación del Menú ---

/**
 * Retorna true si el rol es 'Client'.
 */
const isClientRole = computed(() => {
  return userStore.currentUser?.role === 'Client';
});

/**
 * Retorna true si el usuario (Admin o Manager) tiene acceso de GESTIÓN (con suscripción).
 */
const hasManagementAccess = computed(() => {
  if (isLoadingData.value) return false;

  // Si es Client, no tiene acceso de gestión (Management).
  if (isClientRole.value) {
    return false;
  }

  // Si no es Client (Admin/Manager), requiere suscripción activa.
  return hasActiveSuscription.value;
});


const handleLogout = () => {
  userStore.logout();
  window.location.href = '/';
};
</script>

<style scoped>
/* -------------------------------------- */
/* LAYOUT BASE Y SIDEBAR */
/* -------------------------------------- */
.layout-con-sidebar {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 0;
  flex-shrink: 0;
}

.content-wrapper {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

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

/* -------------------------------------- */
/* MENÚ Y ENLACES */
/* -------------------------------------- */
.menu-list {
  list-style: none;
  padding: 0;
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