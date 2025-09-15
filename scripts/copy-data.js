#!/usr/bin/env node

/**
 * Script pour copier les données mock dans le dossier public
 * Ce script s'assure que les fichiers JSON sont disponibles en production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'data');
const targetDir = path.join(__dirname, '..', 'public', 'data');

console.log('📁 Copie des données mock pour la production...');

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Dossier public/data créé');
}

// Copier tous les fichiers JSON
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ ${file} copié vers public/data/`);
});

console.log('🎉 Données mock prêtes pour la production !');
