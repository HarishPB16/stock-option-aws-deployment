import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  // Use a hardcoded static secret key for local storage encryption
  private secretKey = 'local_enc_key_123_stk_opt';

  constructor() {}

  /**
   * Generates an obfuscated key name using basic encoding
   * so it's not obvious in local storage.
   */
  private getHashedKey(key: string): string {
    return btoa(key).replace(/=/g, ''); // Simple obfuscation for the key name
  }

  public setItem(keyName: string, data: any): void {
    try {
      const hashedKey = this.getHashedKey(keyName);
      const jsonString = JSON.stringify(data);
      const encryptedValue = CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
      localStorage.setItem(hashedKey, encryptedValue);
    } catch (e) {
      console.error('Error saving to secure storage', e);
    }
  }

  public getItem(keyName: string): any {
    try {
      const hashedKey = this.getHashedKey(keyName);
      const encryptedValue = localStorage.getItem(hashedKey);
      
      if (!encryptedValue) {
        return null;
      }

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedValue, this.secretKey);
      const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
          return null; // Might happen if secret key changed or data corrupted
      }

      return JSON.parse(decryptedString);
    } catch (e) {
      console.error('Error reading from secure storage', e);
      return null;
    }
  }

  public removeItem(keyName: string): void {
    const hashedKey = this.getHashedKey(keyName);
    localStorage.removeItem(hashedKey);
  }

  public clear(): void {
    localStorage.clear();
  }
}
