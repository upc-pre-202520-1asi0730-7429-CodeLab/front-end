export class Suscription {
    constructor({
                    id = 0,
                    plan = 0,
                    payPalTransactionId = "",
                    statu = 0,
                }) {
        this.id = id;
        this.plan = plan;
        this.payPalTransactionId = payPalTransactionId;
        this.statu = statu;
    }
}