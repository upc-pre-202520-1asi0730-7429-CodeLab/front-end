import { Room } from "../domain/model/room.entity.js";

export class RoomsAssembler {
    static toEntityFromResource(resource) {
        return new Room({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.rooms ?? [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}