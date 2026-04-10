import * as CryptoJS from 'crypto-js';

// Must map to backend's explicit configuration
const SECRET_KEY = 'admin_secret';

export const decryptPayload = (encryptedHex: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedHex, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (e) {
        console.error('Decryption failed for secure payload. Keys or formats mismatch.', e);
        throw e;
    }
};
