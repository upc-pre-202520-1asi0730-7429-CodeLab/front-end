import { defineStore } from "pinia";
import { ref } from "vue";
import { SuscriptionsApi } from "../infrastructure/suscriptions-api.js";
import { SuscriptionsAssembler } from "../infrastructure/suscription.assembler.js";

const api = new SuscriptionsApi();

const useSuscriptionStore = defineStore("suscriptions", () => {
    const suscriptions = ref([]);
    const currentSuscription = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    const fetchSuscriptions = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getSuscriptions();
            suscriptions.value = SuscriptionsAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const createSuscription = async ({ plan, payPalTransactionId, statu }) => {
        loading.value = true;
        errors.value = [];
        try {
            // Enviamos los datos al back
            await api.createSuscription({ plan, payPalTransactionId, statu });
            await fetchSuscriptions();
            return true;
        } catch (err) {
            console.error(err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        suscriptions,
        currentSuscription,
        loading,
        errors,
        fetchSuscriptions,
        createSuscription
    };
});

export default useSuscriptionStore;