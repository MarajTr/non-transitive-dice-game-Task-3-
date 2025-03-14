const crypto = require("crypto");

class HMACGenerator {
    constructor() {
        this.secretKey = this.generateNewKey(); 
    }

    generateNewKey() {
        return crypto.randomBytes(32).toString("hex"); 
    }

    generateHMAC(message) {
        const hmac = crypto.createHmac("sha256", this.secretKey).update(message).digest("hex");
        return { hmac, key: this.secretKey }; 
    }

    verifyHMAC(message, hmac, key) {
        const calculatedHMAC = crypto.createHmac("sha256", key).update(message).digest("hex");
        return calculatedHMAC === hmac;
    }
}

module.exports = HMACGenerator;
