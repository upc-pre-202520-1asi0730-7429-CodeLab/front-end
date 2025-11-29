export class Hotel {
    constructor({
                    id = null,
                    name = "",
                    images = "",
                    address = "",
                    phone = "",
                    userId = 0
                }) {
        this.id = id;
        this.name = name;
        this.images = images;
        this.address = address;
        this.phone = phone;
        this.userId = userId;
    }
}
