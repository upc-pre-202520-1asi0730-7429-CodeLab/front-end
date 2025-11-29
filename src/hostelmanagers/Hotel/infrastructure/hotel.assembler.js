import { Hotel } from "../domain/model/hotel.entity.js";

export class HotelsAssembler {
    static toEntityFromResource(resource) {
        return new Hotel({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.hotels ?? [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}
