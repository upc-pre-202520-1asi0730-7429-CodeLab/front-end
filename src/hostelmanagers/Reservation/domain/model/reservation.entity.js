export class Reservation {
    constructor({
                    id = null,
                    userId = "",
                    roomId = 0,
                    checkInDate = "",
                    checkOutDate = "",
                    status = ""
                }) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = status;
    }
}