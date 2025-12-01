// rooms/domain/model/room.entity.js
export class Room {
    constructor({
                    id = null,
                    image = "",
                    type = "",
                    price = 0,
                    hotelId = null,
                    isAvailable = true
                }) {
        this.id = id;
        this.image = image;
        this.type = type;
        this.price = price;
        this.hotelId = hotelId;
        this.isAvailable = isAvailable;
    }
}