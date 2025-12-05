export class Suscription {
    constructor({
                    id = null,
                    plan = 0,
                    payPalTransactionId = "",
                    statu = 1
                }) {
        this.id = id;
        this.plan = plan; // Se manejará como Enum (0, 1, 2)
        this.payPalTransactionId = payPalTransactionId;
        this.statu = statu; // 0: Suscrito, 1: NoSuscrito
    }
}