// src/hostelmanagers/IAM/application/auth.store.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { UsersApi } from "../infrastructure/user-api.js";
import { UsersAssembler } from "../infrastructure/user.assembler.js";
import {router} from "json-server";

const usersApi = new UsersApi();

export const useAuthStore = defineStore("auth", () => {
    const user = ref(JSON.parse(localStorage.getItem("currentUser")) || null);
    const token = ref(localStorage.getItem("token") || null);
    const loading = ref(false);
    const errors = ref([]);

    const login = async ({ username, password }) => {
        loading.value = true;
        errors.value = [];

        try {
            const response = await usersApi.signIn({ username, password });

            // Asumiendo que la respuesta tiene el formato { token, user }
            token.value = response.data.token;
            user.value = UsersAssembler.toEntityFromResource(response.data.user);

            // Guardar en localStorage
            localStorage.setItem("token", token.value);
            localStorage.setItem("currentUser", JSON.stringify(user.value));

            return true;
        } catch (err) {
            errors.value.push(err.message || "Error de autenticación");
            return false;
        } finally {
            loading.value = false;
        }
    };

    const logout = () => {
        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push({ name: "login" });
    };

    const register = async ({ username, password, names, roles }) => {
        loading.value = true;
        errors.value = [];

        try {
            await usersApi.signUp({
                username,
                password,
                names,
                roles
            });

            return true;
        } catch (err) {
            errors.value.push(err.message || "Error al registrar usuario");
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Obtener usuario actual
    const currentUser = () => {
        return user.value;
    };

    // Verificar si el usuario tiene un rol específico
    const hasRole = (role) => {
        return user.value?.roles === role;
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return !!token.value;
    };

    return {
        user,
        token,
        loading,
        errors,
        login,
        logout,
        register,
        currentUser,
        hasRole,
        isAuthenticated
    };
});