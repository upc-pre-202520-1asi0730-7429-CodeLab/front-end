import { defineStore } from "pinia";
import { ref } from "vue";
import { UsersApi } from "../infrastructure/user-api.js";

const usersApi = new UsersApi();

const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
    const token = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const login = async ({ username, password }) => {
        loading.value = true;
        errors.value = [];

        try {
            const response = await usersApi.signIn({ username, password });

            const { token: accessToken, id, username: uname } = response.data;

            const currentUser = { id, username: uname };

            token.value = accessToken;
            user.value = currentUser;

            localStorage.setItem("token", accessToken);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            return true;
        } catch (err) {
            errors.value.push(err);
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
    };

    return { user, token, loading, errors, login, logout };
});

export default useAuthStore;
