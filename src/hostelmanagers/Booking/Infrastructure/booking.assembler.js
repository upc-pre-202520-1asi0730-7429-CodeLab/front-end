// bookings/infrastructure/booking.assembler.js
import { Booking } from "../domain/model/booking.entity.js";

export class BookingsAssembler {
    static toEntityFromResource(resource) {
        return new Booking({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.bookings ?? [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}