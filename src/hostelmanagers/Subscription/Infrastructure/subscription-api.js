// suscriptions/infrastructure/suscription.api.js
import { BaseApi } from "../../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint.js";

// Define la ruta base para el endpoint de suscripciones
// Asumiendo que usas una variable de entorno similar
const suscriptionsEndpointPath = import.meta.env.VITE_SUSCRIPTIONS_ENDPOINT_PATH || '/api/v1/suscriptions';

export class SuscriptionsApi extends BaseApi {
    #suscriptionsEndpoint;

    /**
     * Constructor que inicializa la clase base y el endpoint específico de suscripciones.
     */
    constructor() {
        super();
        // Inicializa un BaseEndpoint para manejar las operaciones CRUD estándar
        this.#suscriptionsEndpoint = new BaseEndpoint(this, suscriptionsEndpointPath);
    }

    // --- MÉTODOS DE LECTURA (GET) ---

    /**
     * GET /api/v1/suscriptions
     * Obtiene todas las suscripciones.
     * Corresponde a 'Get all suscription' de tu endpoint.
     */
    getAllSuscriptions() {
        return this.#suscriptionsEndpoint.getAll();
    }

    /**
     * GET /api/v1/suscriptions/{id} (Asumiendo que existe un endpoint GET por ID)
     * Obtiene una suscripción por su ID.
     */
    getSuscriptionById(id) {
        return this.#suscriptionsEndpoint.getById(id);
    }

    // --- MÉTODOS DE CREACIÓN (POST) ---

    /**
     * POST /api/v1/suscriptions
     * Crea una nueva suscripción.
     * Corresponde a 'Create a profile' de tu endpoint.
     * @param {Object} resource - El DTO/Recurso de la suscripción a crear.
     */
    createSuscription(resource) {
        return this.#suscriptionsEndpoint.create(resource);
    }

    // --- MÉTODOS DE ACTUALIZACIÓN (PUT/PATCH) ---

    /**
     * PUT/PATCH /api/v1/suscriptions/{id} (Asumiendo que estos endpoints existen)
     * Actualiza una suscripción existente.
     * @param {number|string} id - El ID de la suscripción a actualizar.
     * @param {Object} resource - El DTO/Recurso con los datos actualizados.
     */
    updateSuscription(id, resource) {
        return this.#suscriptionsEndpoint.update(id, resource);
    }

    // --- MÉTODOS DE ELIMINACIÓN (DELETE) ---

    /**
     * DELETE /api/v1/suscriptions/{id} (Asumiendo que este endpoint existe)
     * Elimina una suscripción por ID.
     * @param {number|string} id - El ID de la suscripción a eliminar.
     */
    deleteSuscription(id) {
        return this.#suscriptionsEndpoint.delete(id);
    }
}