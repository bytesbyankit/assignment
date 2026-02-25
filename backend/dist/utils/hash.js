"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHash = void 0;
const crypto_1 = require("crypto");
/**
 * Computes SHA-256 hash of a string.
 */
const computeHash = (data) => {
    return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
};
exports.computeHash = computeHash;
//# sourceMappingURL=hash.js.map