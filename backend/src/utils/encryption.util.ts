import CryptoJS from 'crypto-js';

// Consistent with frontend's shared secret
const SECRET_KEY = 'admin_secret';

export const encryptPayload = (data: any): string => {
    try {
        const jsonStr = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
        return encrypted;
    } catch (e) {
        console.error('Encryption failed', e);
        throw e;
    }
};

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
