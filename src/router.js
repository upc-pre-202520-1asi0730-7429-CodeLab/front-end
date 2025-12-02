
import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "./shared/presentation/components/layout.vue";
import Login from "./hostelmanagers/IAM/presentation/views/login.vue";
import Register from "./hostelmanagers/IAM/presentation/views/register.vue";
import CreateHotel from "./hostelmanagers/Hotel/presentation/views/create.hotel.vue";
import UpdateHotel from "./hostelmanagers/Hotel/presentation/views/actualizar.hotel.vue";
import EliminarHotel from "./hostelmanagers/Hotel/presentation/views/eliminar.hotel.vue";
import MostrarHoteles from "./hostelmanagers/Hotel/presentation/views/mostrar.hotel.vue";
import PageNotFound from "./shared/presentation/views/page-not-found.vue";
import SiderbarContent from "./shared/presentation/components/siderbar-content.vue";
import RoomListView from "./hostelmanagers/Room/Presentation/Views/RoomListView.vue";
import CreateRoom from "./hostelmanagers/Room/Presentation/Views/CreateRoom.vue";
import EditRoomView from "./hostelmanagers/Room/Presentation/Views/EditRoomView.vue";
import SubscriptionView from "./hostelmanagers/Subscription/Presentation/views/SubscriptionView.vue";
import ClientHotelView from "./hostelmanagers/Hotel/presentation/views/client.hotel.vue";
import DetailsHotel from "./hostelmanagers/Hotel/presentation/views/details.hotel.vue";
import ReservationView from "./hostelmanagers/Reservation/presentation/Views/ReservationView.vue";
import CreateReservation from "./hostelmanagers/Reservation/presentation/Views/createReservation.vue";
// The following line caused the SyntaxError and has been removed:
// import {routes} from "vue-router/auto-routes";

const router = createRouter({
    history: createWebHistory(),
    routes: [

        {
            path: "/",
            name: "login",
            component: Login,
            meta: { title: "Login", public: true }
        },
        {
            path: "/register",
            name: "register",
            component: Register,
            meta: { title: "Register", public: true }
        },

        {
            path: "/sidebar",
            name: "Sidebar",
            component: SiderbarContent,
            children: [
                {
                    path: "/hotels",
                    name: "show-hotels",
                    component: MostrarHoteles,
                },
                {
                    path: "/hotels/create",
                    name: "create-hotel",
                    component: CreateHotel,
                },
                {
                    path: "/hotels/:id/edit",
                    name: "update-hotel",
                    component: UpdateHotel,
                },
                {
                    path: "/hotels/delete",
                    name: "delete-hotel",
                    component: EliminarHotel,
                },
                {
                    path: "/rooms",
                    name: "Rooms",
                    component: RoomListView,
                },
                {
                    path: "/rooms/create/:hotelId",
                    name: "CreateRooms",
                    component: CreateRoom,
                    props: true,
                },
                {
                    path: '/rooms/:hotelId/edit/:id',
                    name: 'edit-room',
                    component: EditRoomView,
                    props: true
                },
                {
                    path: '/subscriptions',
                    name: 'subscription',
                    component: SubscriptionView,
                },
                {
                    path: '/hotels_user',
                    name: 'HotelsUser',
                    component: ClientHotelView,
                },
                {
                    path: '/hotels/details/:id',
                    name: 'DetailsHotel',
                    component: DetailsHotel,
                },
                {
                    path: '/reservations',
                    name: 'Reservations',
                    component: ReservationView,
                },
                {
                    path: '/reservations/create/:id',
                    name: 'ReservationsCreate',
                    component: CreateReservation,
                    props: true,
                },
                ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: PageNotFound
        }


    ]
});

export default router;