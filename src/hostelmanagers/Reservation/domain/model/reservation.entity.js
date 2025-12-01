// reservations/domain/model/reservation.entity.js
export class Reservation {
    constructor({
                    id = null,
                    roomId = null,
                    userId = null,
                    hotelId = null,
                    checkInDate = "",
                    checkOutDate = "",
                    status = "pending", // pending, checked-in, checked-out, cancelled
                    totalPrice = 0,
                    guestName = "",
                    guestEmail = ""
                }) {
        this.id = id;
        this.roomId = roomId;
        this.userId = userId;
        this.hotelId = hotelId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = status;
        this.totalPrice = totalPrice;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
    }
}