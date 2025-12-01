// bookings/domain/model/booking.entity.js
export class Booking {
    constructor({
                    id = null,
                    userId = null,
                    roomId = null,
                    checkInDate = "",
                    checkOutDate = "",
                    status = "Pending", // Pending, Confirmed, Completed, Cancelled
                    room = null
                }) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = status;
        this.room = room;
    }
}