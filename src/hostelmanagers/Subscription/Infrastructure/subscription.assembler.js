

import {Suscription} from "../Domain/Model/subscription.entity.js";

/**
 * Clase estática responsable de la conversión entre
 * objetos de Recurso (API/DTO) y la Entidad de Dominio (Suscription).
 */
export class SuscriptionsAssembler {

    /**
     * Convierte un objeto de recurso a una instancia de la entidad Suscription.
     * @param {Object} resource - El objeto de datos recibido de la API.
     * @returns {Suscription} La entidad de dominio.
     */
    static toEntityFromResource(resource) {
        return new Suscription({ ...resource });
    }

    /**
     * Convierte la respuesta completa de la API (listado) en un array de entidades Suscription.
     * @param {Object} response - La respuesta completa del servicio/API.
     * @returns {Suscription[]} Array de entidades Suscription.
     */
    static toEntitiesFromResponse(response) {
        // La respuesta GET /api/v1/suscriptions devuelve un array directamente en la raíz (cuerpo 200)
        // Por lo tanto, comprobamos si la respuesta es un array.
        const resources = Array.isArray(response)
            ? response
            : Array.isArray(response.data) // Si la respuesta está envuelta en 'data'
                ? response.data
                : response.data?.suscriptions ?? []; // Asumiendo un campo de lista anidado

        // Basándonos en tu respuesta 200 GET, parece que es un array directo.
        if (Array.isArray(response)) {
            return response.map(r => this.toEntityFromResource(r));
        }

        // Si la respuesta es un objeto que contiene los datos (como en el POST 201), manejamos la estructura anidada
        const dataToProcess = Array.isArray(response.data)
            ? response.data
            : response.data?.resource // Respuesta POST /api/v1/suscriptions devuelve { "resource": { ... } }
                ? [response.data.resource] // Lo convertimos en un array para mapearlo
                : response.data?.suscriptions ?? []; // Alternativa común para listas

        return Array.isArray(dataToProcess)
            ? dataToProcess.map(r => this.toEntityFromResource(r))
            : [];
    }
}