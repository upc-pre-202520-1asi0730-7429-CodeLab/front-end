export class Suscription {
    constructor({
                    id = 0,
                    userId = "",
                    plan = 0,
                    payPalTransactionId = "",
                    statu = 0,
                }) {
        this.id = id;
        this.userId = userId;
        this.plan = plan;
        this.payPalTransactionId = payPalTransactionId;
        this.statu = statu;
    }
}