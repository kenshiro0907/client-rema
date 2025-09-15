// Validation et sanitisation des entrées utilisateur
export class InputValidation {
  // Sanitisation HTML pour prévenir XSS
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
  
  // Validation des entrées de formulaire
  static validateFormInput(input: string, type: 'text' | 'email' | 'phone' | 'address'): {
    isValid: boolean;
    sanitizedValue: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitizedValue = input.trim();
    
    // Sanitisation de base
    sanitizedValue = this.sanitizeHtml(sanitizedValue);
    
    // Validation selon le type
    switch (type) {
      case 'email':
        if (!this.isValidEmail(sanitizedValue)) {
          errors.push('Format d\'email invalide');
        }
        break;
        
      case 'phone':
        if (!this.isValidPhone(sanitizedValue)) {
          errors.push('Format de téléphone invalide');
        }
        break;
        
      case 'address':
        if (sanitizedValue.length < 5) {
          errors.push('L\'adresse doit contenir au moins 5 caractères');
        }
        break;
        
      case 'text':
        if (sanitizedValue.length < 2) {
          errors.push('Le texte doit contenir au moins 2 caractères');
        }
        break;
    }
    
    // Vérification des caractères dangereux
    if (this.containsDangerousChars(sanitizedValue)) {
      errors.push('Le texte contient des caractères non autorisés');
    }
    
    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors
    };
  }
  
  // Validation d'email
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validation de téléphone
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  // Détection de caractères dangereux
  private static containsDangerousChars(input: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(input));
  }
  
  // Validation des données de ménage
  static validateHouseholdData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.nom || data.nom.trim().length < 2) {
      errors.push('Le nom est requis et doit contenir au moins 2 caractères');
    }
    
    if (!data.prenom || data.prenom.trim().length < 2) {
      errors.push('Le prénom est requis et doit contenir au moins 2 caractères');
    }
    
    if (!data.idSisiao || !/^\d{9}$/.test(data.idSisiao)) {
      errors.push('L\'ID SISIAO doit contenir exactement 9 chiffres');
    }
    
    if (!data.adresse || data.adresse.trim().length < 5) {
      errors.push('L\'adresse est requise et doit contenir au moins 5 caractères');
    }
    
    if (!data.codePostal || !/^\d{5}$/.test(data.codePostal)) {
      errors.push('Le code postal doit contenir exactement 5 chiffres');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Échappement des caractères spéciaux pour les requêtes
  static escapeForQuery(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
