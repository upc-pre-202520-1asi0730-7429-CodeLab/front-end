// src/hostelmanagers/IAM/application/auth.store.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { UsersApi } from "../infrastructure/user-api.js";

const usersApi = new UsersApi();

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
    const token = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    // Inicializar desde localStorage al crear el store
    const initializeAuth = () => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("currentUser");

        if (storedToken) {
            token.value = storedToken;
        }

        if (storedUser) {
            try {
                user.value = JSON.parse(storedUser);
            } catch (e) {
                console.error("Error parsing stored user:", e);
                localStorage.removeItem("currentUser");
            }
        }
    };

    // Ejecutar inicialización
    initializeAuth();

    // Computed properties
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.roles === "Admin");
    const isClient = computed(() => user.value?.roles === "Client");
    const currentUser = computed(() => user.value);

    const login = async ({ username, password }) => {
        loading.value = true;
        errors.value = [];

        try {
            const response = await usersApi.signIn({ username, password });

            // Extraer los datos de la respuesta
            const { token: accessToken, id, username: uname, names, roles } = response.data;

            // Crear objeto de usuario completo
            const userData = {
                id,
                username: uname,
                names: names || uname,
                roles: roles || "Client"
            };

            token.value = accessToken;
            user.value = userData;

            // Guardar en localStorage
            localStorage.setItem("token", accessToken);
            localStorage.setItem("currentUser", JSON.stringify(userData));

            console.log("Login successful:", userData);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Authentication error";
            errors.value.push(errorMessage);
            console.error("Login error:", err);
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
        console.log("Logout successful");
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

            console.log("Registration successful");
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Registration error";
            errors.value.push(errorMessage);
            console.error("Register error:", err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const clearErrors = () => {
        errors.value = [];
    };

    return {
        // State
        user,
        token,
        loading,
        errors,

        // Computed
        currentUser,
        isAuthenticated,
        isAdmin,
        isClient,

        // Actions
        login,
        logout,
        register,
        clearErrors
    };
});

// Export default para compatibilidad
export default useAuthStore;