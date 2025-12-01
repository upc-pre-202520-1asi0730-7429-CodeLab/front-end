// suscriptions/application/suscription.store.js
import { defineStore } from "pinia";
import { ref } from "vue";
import {SuscriptionsApi} from "../Infrastructure/subscription-api.js";
import {SuscriptionsAssembler} from "../Infrastructure/subscription.assembler.js";

// Inicializa la instancia de la API
const api = new SuscriptionsApi();

export const useSuscriptionStore = defineStore("suscriptions", () => {
    // --- ESTADO ---
    const suscriptions = ref([]);
    const currentSuscription = ref(null);
    const loading = ref(false);
    const errors = ref([]);

    // --- ACCIONES (MÉTODOS) ---

    /**
     * GET /api/v1/suscriptions
     * Obtiene todas las suscripciones de la API y las guarda como entidades.
     */
    const fetchSuscriptions = async () => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getAllSuscriptions();

            // 💡 NOTA: Basándonos en tu respuesta 200 GET, el cuerpo es directamente el array.
            // El Assembler debe manejar esto.
            suscriptions.value = SuscriptionsAssembler.toEntitiesFromResponse(response.data || response);

        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * GET /api/v1/suscriptions/{id}
     * Obtiene una suscripción por su ID.
     * @param {number|string} id - El ID de la suscripción.
     */
    const fetchSuscriptionById = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            const response = await api.getSuscriptionById(id);

            // Asumiendo que getSuscriptionById devuelve el objeto de recurso directamente
            currentSuscription.value = SuscriptionsAssembler.toEntityFromResource(response.data);

        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * POST /api/v1/suscriptions
     * Crea una nueva suscripción.
     * @param {Object} suscriptionData - El DTO/Recurso a enviar.
     * @returns {boolean} Éxito o fracaso.
     */
    const createSuscription = async (suscriptionData) => {
        loading.value = true;
        errors.value = [];
        try {
            // El API controller maneja el envío del DTO (resource)
            const response = await api.createSuscription(suscriptionData);

            // Después de crear, recargamos la lista completa para tener los datos actualizados
            await fetchSuscriptions();

            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * PUT/PATCH /api/v1/suscriptions/{id} (Asumiendo que existe)
     * Actualiza una suscripción existente.
     * @param {number|string} id - El ID de la suscripción.
     * @param {Object} suscriptionData - El DTO/Recurso con los datos actualizados.
     * @returns {boolean} Éxito o fracaso.
     */
    const updateSuscription = async (id, suscriptionData) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.updateSuscription(id, suscriptionData);

            // Recargamos la lista después de la actualización
            await fetchSuscriptions();

            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * DELETE /api/v1/suscriptions/{id} (Asumiendo que existe)
     * Elimina una suscripción.
     * @param {number|string} id - El ID de la suscripción a eliminar.
     * @returns {boolean} Éxito o fracaso.
     */
    const deleteSuscription = async (id) => {
        loading.value = true;
        errors.value = [];
        try {
            await api.deleteSuscription(id);

            // Recargamos la lista después de la eliminación
            await fetchSuscriptions();

            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };


    // --- RETORNO DE ESTADO Y ACCIONES ---
    return {
        suscriptions,
        currentSuscription,
        loading,
        errors,
        fetchSuscriptions,
        fetchSuscriptionById,
        createSuscription,
        updateSuscription,
        deleteSuscription
    };
});