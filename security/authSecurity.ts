// Sécurité de l'authentification
export class AuthSecurity {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly PASSWORD_MIN_LENGTH = 8;
  
  // Validation du mot de passe
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      errors.push(`Le mot de passe doit contenir au moins ${this.PASSWORD_MIN_LENGTH} caractères`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Rate limiting pour les tentatives de connexion
  static checkLoginAttempts(email: string): { canAttempt: boolean; remainingTime?: number } {
    const key = `login_attempts_${email}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    
    // Nettoyer les tentatives anciennes
    const recentAttempts = attempts.filter((attempt: number) => 
      now - attempt < this.LOCKOUT_DURATION
    );
    
    if (recentAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      const oldestAttempt = Math.min(...recentAttempts);
      const remainingTime = this.LOCKOUT_DURATION - (now - oldestAttempt);
      
      return {
        canAttempt: false,
        remainingTime: Math.max(0, remainingTime)
      };
    }
    
    return { canAttempt: true };
  }
  
  // Enregistrer une tentative de connexion
  static recordLoginAttempt(email: string): void {
    const key = `login_attempts_${email}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    attempts.push(Date.now());
    localStorage.setItem(key, JSON.stringify(attempts));
  }
  
  // Réinitialiser les tentatives après connexion réussie
  static resetLoginAttempts(email: string): void {
    const key = `login_attempts_${email}`;
    localStorage.removeItem(key);
  }
  
  // Validation de l'email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
