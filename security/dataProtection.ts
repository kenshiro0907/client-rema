// Protection des données sensibles
export class DataProtection {
  private static readonly ENCRYPTION_KEY = 'ariane-rema-secure-key'; // À remplacer par une vraie clé
  
  // Chiffrement simple des données sensibles (à améliorer en production)
  static encrypt(data: string): string {
    try {
      // En production, utiliser une vraie bibliothèque de chiffrement
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }
  
  // Déchiffrement des données
  static decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }
  
  // Stockage sécurisé des données sensibles
  static setSecureData(key: string, data: any): void {
    try {
      const encryptedData = this.encrypt(JSON.stringify(data));
      sessionStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error('Secure storage error:', error);
    }
  }
  
  // Récupération sécurisée des données
  static getSecureData(key: string): any {
    try {
      const encryptedData = sessionStorage.getItem(key);
      if (!encryptedData) return null;
      
      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Secure retrieval error:', error);
      return null;
    }
  }
  
  // Suppression sécurisée des données
  static removeSecureData(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  // Nettoyage complet des données sensibles
  static clearAllSecureData(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_') || key.includes('auth') || key.includes('user')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  // Masquage des données sensibles dans les logs
  static maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/(password|token|secret|key)=[^&\s]+/gi, '$1=***');
    }
    
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'email'];
      
      sensitiveKeys.forEach(key => {
        if (masked[key]) {
          masked[key] = '***';
        }
      });
      
      return masked;
    }
    
    return data;
  }
}
