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

export interface Household {
  id: string;
  nom: string;
  prenom: string;
  idSisiao: string;
  adresse: string;
  codePostal: string;
  secteur: number;
  statut: "A rencontrer" | "Rencontré" | "Clôturé";
  synthese: string;
  compositionFamiliale: string;
  members: Member[];
  demande?: Demande;
  history?: Demande[];
  contacts?: ContactData[];
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
