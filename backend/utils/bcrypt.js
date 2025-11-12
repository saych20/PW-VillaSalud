const bcrypt = require('bcryptjs');

class BcryptUtils {
    // Hash de contraseña
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Comparar contraseña
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Generar salt
    static async generateSalt(rounds = 12) {
        return await bcrypt.genSalt(rounds);
    }
}

module.exports = BcryptUtils;