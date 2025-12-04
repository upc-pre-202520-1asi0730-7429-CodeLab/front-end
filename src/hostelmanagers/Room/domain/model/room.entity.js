export class Room {
    constructor({
                    id = null,
                    imagen = "",
                    type = "",
                    price = 0,
                    hotelId = 0
                }) {
        this.id = id;
        this.imagen = imagen;
        this.type = type;
        this.price = price;
        this.hotelId = hotelId;
    }
}