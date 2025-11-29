export class User {
    constructor({
                    id = null,
                    username = "",
                    password = "",
                    names = "",
                    roles = ""
                }) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.names = names;
        this.roles = roles;
    }
}
