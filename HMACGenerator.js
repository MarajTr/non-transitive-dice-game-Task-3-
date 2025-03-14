const crypto = require("crypto");

class HMACGenerator {
    generateNewKey() {
        return crypto.randomBytes(32).toString("hex"); // Generate a new key each time
    }

    generateHMAC(message) {
        const key = this.generateNewKey(); // Generate a new key for each message
        const hmac = crypto.createHmac("sha256", key).update(message).digest("hex");
        return { hmac, key }; // Return both HMAC and the key for verification
    }

    verifyHMAC(message, hmac, key) {
        const calculatedHMAC = crypto.createHmac("sha256", key).update(message).digest("hex");
        return calculatedHMAC === hmac;
    }
}

module.exports = HMACGenerator;
