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

export const encryptPayload = (data: any): string => {
    try {
        const jsonStr = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
    } catch (e) {
        console.error('Encryption failed for secure payload.', e);
        throw e;
    }
};

