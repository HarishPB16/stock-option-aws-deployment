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
