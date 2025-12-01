export class Room {
    constructor({
                    id = null,
                    image = "",
                    type = "",
                    price = 0,
                    hotelId = null
                }) {
        this.id = id;
        this.image = image;
        this.type = type;
        this.price = price;
        this.hotelId = hotelId;
    }
}