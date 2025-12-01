import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./hostelmanagers/IAM/application/auth.store.js";
import MainLayout from "./shared/presentation/components/layout.vue";
import Login from "./hostelmanagers/IAM/presentation/views/login.vue";
import Register from "./hostelmanagers/IAM/presentation/views/register.vue";
import CreateHotel from "./hostelmanagers/Hotel/presentation/views/create.hotel.vue";
import UpdateHotel from "./hostelmanagers/Hotel/presentation/views/actualizar.hotel.vue";
import EliminarHotel from "./hostelmanagers/Hotel/presentation/views/eliminar.hotel.vue";
import MostrarHoteles from "./hostelmanagers/Hotel/presentation/views/mostrar.hotel.vue";
import PageNotFound from "./shared/presentation/views/page-not-found.vue";

// Importar vistas de Habitaciones
import RoomListView from "./hostelmanagers/Room/presentation/views/RoomListView.vue";
import CreateRoomView from "./hostelmanagers/Room/presentation/views/CreateRoomDialog.vue";
import EditRoomView from "./hostelmanagers/Room/presentation/views/EditRoomView.vue";

// Importar vistas de Reservas
import CreateBookingView from "./hostelmanagers/Booking/presentation/views/CreateBookingView.vue";
import MyBookingsView from "./hostelmanagers/Booking/presentation/views/MyBookingsView.vue";
import HotelBookingsView from "./hostelmanagers/Booking/presentation/views/HotelBookingsView.vue";
import BookingDetailsView from "./hostelmanagers/Booking/presentation/views/BookingDetailsView.vue";

const routes = [
    {
        path: "/",
        component: MainLayout,
        children: [
            {
                path: "",
                name: "home",
                component: MostrarHoteles,
                meta: { title: "Hoteles", public: false }
            },
            {
                path: "login",
                name: "login",
                component: Login,
                meta: { title: "Login", public: true }
            },
            {
                path: "register",
                name: "register",
                component: Register,
                meta: { title: "Register", public: true }
            },
            {
                path: "hotels",
                name: "show-hotels",
                component: MostrarHoteles,
                meta: { title: "Hoteles", public: false }
            },
            {
                path: "hotels/create",
                name: "create-hotel",
                component: CreateHotel,
                meta: { title: "Crear Hotel", public: false, requiresAdmin: true }
            },
            {
                path: "hotels/:id/edit",
                name: "update-hotel",
                component: UpdateHotel,
                meta: { title: "Editar Hotel", public: false, requiresAdmin: true }
            },
            {
                path: "hotels/delete",
                name: "delete-hotel",
                component: EliminarHotel,
                meta: { title: "Eliminar Hotel", public: false, requiresAdmin: true }
            },
            // Rutas para Habitaciones
            {
                path: "hotels/:hotelId/rooms",
                name: "hotel-rooms",
                component: RoomListView,
                meta: { title: "Habitaciones", public: false }
            },
            {
                path: "hotels/:hotelId/rooms/create",
                name: "create-room",
                component: CreateRoomView,
                meta: { title: "Crear Habitación", public: false, requiresAdmin: true }
            },
            {
                path: "rooms/:id/edit",
                name: "edit-room",
                component: EditRoomView,
                meta: { title: "Editar Habitación", public: false, requiresAdmin: true }
            },
            // Rutas para Reservas
            {
                path: "rooms/:roomId/booking",
                name: "create-booking",
                component: CreateBookingView,
                meta: { title: "Nueva Reserva", public: false, requiresClient: true }
            },
            {
                path: "my-bookings",
                name: "my-bookings",
                component: MyBookingsView,
                meta: { title: "Mis Reservas", public: false, requiresClient: true }
            },
            {
                path: "hotels/:hotelId/bookings",
                name: "hotel-bookings",
                component: HotelBookingsView,
                meta: { title: "Reservas del Hotel", public: false, requiresAdmin: true }
            },
            {
                path: "bookings/:id",
                name: "booking-details",
                component: BookingDetailsView,
                meta: { title: "Detalles de Reserva", public: false }
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: PageNotFound,
        meta: { title: "Página no encontrada", public: true }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Guardias de navegación
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = !!authStore.token;

    // Actualizar título de la página
    document.title = to.meta.title || "Hotel Management System";

    // Redirigir a login si no está autenticado y la ruta no es pública
    if (!to.meta.public && !isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } });
        return;
    }

    // Si está autenticado y trata de acceder a login/register, redirigir al home
    if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
        next({ name: 'home' });
        return;
    }

    // Verificar roles de administrador
    if (to.meta.requiresAdmin && authStore.user?.roles !== 'Admin') {
        next({ name: 'home' });
        return;
    }

    // Verificar roles de cliente
    if (to.meta.requiresClient && authStore.user?.roles !== 'Client') {
        next({ name: 'home' });
        return;
    }

    next();
});

export default router;