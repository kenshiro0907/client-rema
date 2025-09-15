export interface Demande {
  idDemande: string;
  statutDemandeSisiao: string;
  date: string;
  localisation: {
    adresse: string;
    codePostal: string;
    commentaire: string;
  };
  details: {
    typeDemandes: string;
    commentaire: string;
  };
}

export interface Member {
  id: string;
  isPrincipal: boolean;
  nom: string;
  prenom: string;
  tel: string;
  naissance: string;
  age: number;
  sexe: "F" | "M";
  situation: string;
}

export interface MaterialPrestation {
  duvet: number;
  kit: number;
  vetement: number;
}

export interface ContactData {
  contactType: "sans_echange" | "avec_echange";
  sansEchangeMotifs: string[];
  avecEchangeMotifs: string[];
  prestationType: "denrees" | "materielle" | "boisson";
  prestationsMat: MaterialPrestation;
  commentaire: string;
}

export type ClotureMotif =
  | "Ménage plus en demande"
  | "Ménage hébergé/hospitalisé";

// New types for enhanced household management
export interface EvaluationSisiao {
  id: string;
  date: string;
  type: string;
  statut: string;
  commentaire: string;
  evaluateur: string;
}

export interface SuiviSocialSection {
  lieuVie?: {
    typeLogement: string;
    conditionsMaterielles: string;
    commentaire: string;
  };
  hygieneSante?: {
    etatHygiene: string;
    problemesSante: string;
    commentaire: string;
  };
  alimentation?: {
    accesAlimentation: string;
    habitudesAlimentaires: string;
    commentaire: string;
  };
  ressources?: {
    ressourcesPersonnelles: string;
    ressourcesInstitutionnelles: string;
    commentaire: string;
  };
}

export interface PrestationEMA {
  id: string;
  date: string;
  type: string;
  intervenant: string;
  commentaire: string;
  montant?: number;
}

export interface DiagnosticEMA {
  id: string;
  date: string;
  type: string;
  intervenant: string;
  resultats: string;
  recommandations: string;
}

// Interface pour les données API réelles
export interface HouseholdAPI {
  id: number;
  nom: string;
  prenom: string;
  adresse: string;
  cp: string;                    // Code postal
  ville: string;                 // Ville
  naissance: string;             // Date de naissance
  tel: string;                   // Téléphone
  statut: number;                // Statut numérique
  alerte_personnelle: string | null;
  date_alerte: string | null;
  date_mesure_veille: string | null;
  duree_veille: string | null;
  mesure_veille: string | null;
  precision: string | null;
}

// Interface pour l'application (compatible avec l'existant)
export interface Household {
  id: string;
  nom: string;
  prenom: string;
  idSisiao: string;              // Mappé depuis API.id
  adresse: string;               // Mappé depuis API.ville
  codePostal: string;            // Mappé depuis API.cp
  secteur: number;               // Pas dans l'API, valeur par défaut
  statut: "A rencontrer" | "Rencontré" | "Clôturé"; // Mappé depuis API.statut
  synthese: string;
  compositionFamiliale: string;
  members: Member[];
  demande?: Demande;
  history?: Demande[];
  contacts?: ContactData[];
  // New fields for enhanced functionality
  evaluations?: EvaluationSisiao[];
  suiviSocial?: SuiviSocialSection;
  prestations?: PrestationEMA[];
  diagnostics?: DiagnosticEMA[];
  alertePersonnelle?: string; // Personal alert field
  // Champs API supplémentaires
  naissance?: string;
  tel?: string;
  alerte_personnelle?: string | null;
  date_alerte?: string | null;
  date_mesure_veille?: string | null;
  duree_veille?: string | null;
  mesure_veille?: string | null;
  precision?: string | null;
}

export type NavItem = "Ménage" | "Intervenants" | "Statistiques" | "Dashboard";

export interface User {
  email: string;
  camion: string;
  service: string;
}

export type MarkerType =
  | "position"
  | "signalement"
  | "veille"
  | "exploratoire"
  | "note"
  | "rencontre";

export interface NoteData {
  address: string;
  locationComment: string;
  noteType: string;
  urgency: string;
  object: string;
}

export interface SignalementInfo {
  checked: boolean;
  comment: string;
}

export interface EncounterData {
  address: string;
  postalCode: string;
  city: string;
  locationComment: string;
  composition: string;
  lastName: string;
  firstName: string;
  dob: string;
  wanderingDuration: string;
  phone: string;
  generalComment: string;
  prestationDate?: string;
  prestationTime?: string;
  prestationTypes?: string[];
  prestationDetails?: string;
  prestationComment?: string;
  signalements?: {
    [key: string]: SignalementInfo;
  };
}

export interface MarkerData {
  type: MarkerType;
  address: string;
  note?: NoteData;
  encounter?: EncounterData;
}

export interface SummaryTableData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface DashboardData {
  markers: MarkerData[];
  zoneToExplore: string[];
  summary: {
    laTournee: SummaryTableData;
    lesDistributions: SummaryTableData;
    lesPrestationsSociales: SummaryTableData;
  };
}
