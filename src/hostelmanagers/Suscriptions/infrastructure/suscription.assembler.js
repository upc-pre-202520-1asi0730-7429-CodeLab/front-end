import { Suscription } from "../domain/model/suscription.entity.js";

export class SuscriptionsAssembler {
    static toEntityFromResource(resource) {
        return new Suscription({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        // Ajustamos para leer la data igual que en Hotels
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.suscriptions ?? [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}