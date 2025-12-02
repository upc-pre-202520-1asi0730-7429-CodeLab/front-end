// users/infrastructure/user.assembler.js
import { User } from "../domain/model/user.entity.js";

export class UsersAssembler {
    static toEntityFromResource(resource) {
        return new User({ ...resource });
    }

    /**
     * Convierte respuesta de sign-in en { token, user }
     * Ajusta los nombres de propiedades según tu backend.
     */
    static toAuthFromResponse(response) {
        // Ejemplo esperado: { token, user: { id, username, ... } }
        const { token, user } = response.data;
        return {
            token,
            user: user ? this.toEntityFromResource(user) : null
        };
    }

    static toRoleFromResponse(response) {
        // Extrae directamente los datos esperados
        return {
            userId: response.data.userId,
            role: response.data.role
        };
    }

    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data)
            ? response.data
            : response.data.users ?? [];
        return resources.map(r => this.toEntityFromResource(r));
    }
}
