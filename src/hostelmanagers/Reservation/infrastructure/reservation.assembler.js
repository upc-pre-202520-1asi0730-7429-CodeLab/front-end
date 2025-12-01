// reservations/infrastructure/reservation.assembler.js
import { Reservation } from "../domain/model/reservation.entity.js";

export class ReservationsAssembler {
    static toEntityFromResource(resource) {
        return new Reservation({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.reservations ?? [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}