// IAM/application/register.store.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { UsersApi } from "../infrastructure/user-api.js";

const usersApi = new UsersApi();

const useRegisterStore = defineStore("register", () => {
    const loading = ref(false);
    const errors = ref([]);

    // payload: { username, password, names, roles }
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

            // si tu backend devuelve algo (user, token, etc.) lo puedes usar aquí
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        errors,
        register
    };
});

export default useRegisterStore;
