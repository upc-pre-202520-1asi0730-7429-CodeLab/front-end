// router.js
import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "./shared/presentation/components/layout.vue";

// IAM Views
import Login from "./hostelmanagers/IAM/presentation/views/login.vue";
import Register from "./hostelmanagers/IAM/presentation/views/register.vue";

// Hotel Views - Admin
import AdminDashboard from "./hostelmanagers/Hotel/presentation/views/admin-dashboard.vue";
import AdminHotelDetail from "./hostelmanagers/Hotel/presentation/views/admin-hotel-detail.vue";
import CreateHotel from "./hostelmanagers/Hotel/presentation/views/create.hotel.vue";
import UpdateHotel from "./hostelmanagers/Hotel/presentation/views/actualizar.hotel.vue";
import EliminarHotel from "./hostelmanagers/Hotel/presentation/views/eliminar.hotel.vue";
import MostrarHoteles from "./hostelmanagers/Hotel/presentation/views/mostrar.hotel.vue";

// Hotel Views - Guest

// Room Views
import GuestHotelRooms from "./hostelmanagers/Room/presentation/views/guest-hotel-rooms.vue";

// Reservation Views
import AdminReservations from "./hostelmanagers/Reservation/presentation/views/admin-reservations.vue";
import GuestReservations from "./hostelmanagers/Reservation/presentation/views/guest-reservations.vue";

// Shared
import PageNotFound from "./shared/presentation/views/page-not-found.vue";
import useAuthStore from "./hostelmanagers/IAM/application/auth.store.js";

const routes = [
    {
        path: "/",
        component: MainLayout,
        children: [
            // Public Routes
            {
                path: "",
                redirect: "/login"
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

            // Admin Routes
            {
                path: "admin/dashboard",
                name: "admin-dashboard",
                component: AdminDashboard,
                meta: {
                    title: "Admin Dashboard",
                    requiresAuth: true,
                    role: "Admin"
                }
            },
            {
                path: "admin/hotel/create",
                name: "admin-create-hotel",
                component: CreateHotel,
                meta: {
                    title: "Create Hotel",
                    requiresAuth: true,
                    role: "Admin"
                }
            },
            {
                path: "admin/hotel/:id",
                name: "admin-hotel-detail",
                component: AdminHotelDetail,
                meta: {
                    title: "Hotel Detail",
                    requiresAuth: true,
                    role: "Admin"
                }
            },
            {
                path: "admin/hotel/:id/edit",
                name: "admin-update-hotel",
                component: UpdateHotel,
                meta: {
                    title: "Update Hotel",
                    requiresAuth: true,
                    role: "Admin"
                }
            },
            {
                path: "admin/hotel/delete",
                name: "admin-delete-hotel",
                component: EliminarHotel,
                meta: {
                    title: "Delete Hotel",
                    requiresAuth: true,
                    role: "Admin"
                }
            },
            {
                path: "admin/hotels",
                name: "admin-show-hotels",
                component: MostrarHoteles,
                meta: {
                    title: "Show Hotels",
                    requiresAuth: true,
                    role: "Admin"
                }
            },
            {
                path: "admin/hotel/:hotelId/reservations",
                name: "admin-reservations",
                component: AdminReservations,
                meta: {
                    title: "Reservations Management",
                    requiresAuth: true,
                    role: "Admin"
                }
            },

            // Guest Routes
            {
                path: "guest/hotels",
                name: "guest-hotels",
                component: GuestHotels,
                meta: {
                    title: "Available Hotels",
                    requiresAuth: true,
                    role: "Client"
                }
            },
            {
                path: "guest/hotel/:hotelId/rooms",
                name: "guest-hotel-rooms",
                component: GuestHotelRooms,
                meta: {
                    title: "Available Rooms",
                    requiresAuth: true,
                    role: "Client"
                }
            },
            {
                path: "guest/reservations",
                name: "guest-reservations",
                component: GuestReservations,
                meta: {
                    title: "My Reservations",
                    requiresAuth: true,
                    role: "Client"
                }
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: PageNotFound,
        meta: { title: "Page Not Found", public: true }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Update document title
    document.title = to.meta.title || "Hotel Manager";

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        if (!authStore.token) {
            // Not authenticated, redirect to login
            next({ name: "login" });
            return;
        }

        // Check role authorization
        if (to.meta.role && authStore.user?.roles !== to.meta.role) {
            // Wrong role, redirect to appropriate dashboard
            const redirectRoute = authStore.user?.roles === "Admin"
                ? "admin-dashboard"
                : "guest-hotels";
            next({ name: redirectRoute });
            return;
        }
    }

    // If already authenticated and trying to access login/register
    if ((to.name === "login" || to.name === "register") && authStore.token) {
        const redirectRoute = authStore.user?.roles === "Admin"
            ? "admin-dashboard"
            : "guest-hotels";
        next({ name: redirectRoute });
        return;
    }

    next();
});

export default router;