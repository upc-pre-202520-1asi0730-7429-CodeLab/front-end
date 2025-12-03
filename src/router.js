import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "./shared/presentation/components/layout.vue";
import Login from "./hostelmanagers/IAM/presentation/views/login.vue";
import Register from "./hostelmanagers/IAM/presentation/views/register.vue";
import CreateHotel from "./hostelmanagers/Hotel/presentation/views/create.hotel.vue";
import UpdateHotel from "./hostelmanagers/Hotel/presentation/views/actualizar.hotel.vue";
import EliminarHotel from "./hostelmanagers/Hotel/presentation/views/eliminar.hotel.vue";
import MostrarHoteles from "./hostelmanagers/Hotel/presentation/views/mostrar.hotel.vue";
import MostrarRooms from "./hostelmanagers/Room/presentation/views/mostrar.room.vue";
import CreateRoom from "./hostelmanagers/Room/presentation/views/create.room.vue";
import PageNotFound from "./shared/presentation/views/page-not-found.vue";

const routes = [
    {
        path: "/",
        component: MainLayout,
        children: [
            {
                path: "",
                name: "home",
                component: Login,
                meta: { title: "Login", public: true }
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
            // --- RUTAS DE HOTELES ---
            {
                path: "hotels",
                name: "show-hotels",
                component: MostrarHoteles,
                meta: { title: "Show Hotels", public: true }
            },
            {
                path: "hotels/create",
                name: "create-hotel",
                component: CreateHotel,
                meta: { title: "Create Hotel", public: true }
            },
            {
                path: "hotels/:id/edit",
                name: "update-hotel",
                component: UpdateHotel,
                meta: { title: "Update Hotel", public: true }
            },
            {
                path: "hotels/delete",
                name: "delete-hotel",
                component: EliminarHotel,
                meta: { title: "Delete Hotel", public: true }
            },

            // --- RUTAS DE ROOMS (NUEVAS) ---
            {
                // Esta ruta muestra las habitaciones de UN hotel específico
                path: "hotels/:hotelId/rooms",
                name: "hotel-rooms",
                component: MostrarRooms,
                meta: { title: "Hotel Rooms", public: true }
            },
            {
                // Esta ruta es el formulario para crear habitación en ese hotel
                path: "hotels/:hotelId/rooms/create",
                name: "create-room",
                component: CreateRoom,
                meta: { title: "Create Room", public: true }
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

export default router;