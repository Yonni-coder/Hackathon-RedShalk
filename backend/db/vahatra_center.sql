-- ===========================
-- Création base + tables (MySQL/MariaDB)
-- ===========================

-- 1) Création DB
CREATE DATABASE IF NOT EXISTS vahatra_center
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vahatra_center;

-- 2) Rôles
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL UNIQUE
);
INSERT IGNORE INTO roles (nom) VALUES ('admin'),('gestionnaire'),('agent'),('client');

-- 3) Utilisateurs
DROP TABLE IF EXISTS utilisateurs;
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courriel VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  nom_complet VARCHAR(255),
  telephone VARCHAR(50),
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4) Ressources
DROP TABLE IF EXISTS ressources;
CREATE TABLE ressources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  type_ressource ENUM('salle','bureau') NOT NULL,
  capacite INT NOT NULL,
  emplacement VARCHAR(255),
  est_actif TINYINT(1) NOT NULL DEFAULT 1,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5) Tarifs
DROP TABLE IF EXISTS tarifs;
CREATE TABLE tarifs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ressource_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prix_par_heure DECIMAL(10, 2) DEFAULT NULL,
    prix_par_jour DECIMAL(10, 2) DEFAULT NULL,
    devise VARCHAR(10) NOT NULL DEFAULT 'MGA',
    est_actif TINYINT(1) NOT NULL DEFAULT 1,
    cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tarif_ressource FOREIGN KEY (ressource_id) REFERENCES ressources(id) ON DELETE CASCADE
);

-- 6) Réservations
DROP TABLE IF EXISTS reservations;
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ressource_id INT NOT NULL,
  utilisateur_id INT NULL,
  debut DATETIME NOT NULL,
  fin DATETIME NOT NULL,
  statut ENUM('en_attente','confirmee','annulee','rejettee') NOT NULL DEFAULT 'en_attente',
  titre VARCHAR(255) NULL,
  description TEXT NULL,
  prix DECIMAL(10,2) NOT NULL DEFAULT 0,
  devise VARCHAR(10) NOT NULL DEFAULT 'MGA',
  statut_paiement ENUM('aucun','en_attente','paye','echoue','rembourse') NOT NULL DEFAULT 'aucun',
  annule_par INT NULL,
  raison_annulation TEXT NULL,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_ressource FOREIGN KEY (ressource_id) REFERENCES ressources(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
  CONSTRAINT fk_res_annule_par FOREIGN KEY (annule_par) REFERENCES utilisateurs(id) ON DELETE SET NULL,
  CONSTRAINT chk_res_temps CHECK (debut < fin)
);
CREATE INDEX idx_res_ressource_temps ON reservations (ressource_id, debut, fin);
CREATE INDEX idx_res_statut ON reservations (statut);

-- 7) Verrous de réservation
DROP TABLE IF EXISTS verrous_reservation;
CREATE TABLE verrous_reservation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ressource_id INT NOT NULL,
  session_utilisateur_id VARCHAR(255) NOT NULL,
  debut DATETIME NOT NULL,
  fin DATETIME NOT NULL,
  verrouille_jusqua DATETIME NOT NULL,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vr_ressource FOREIGN KEY (ressource_id) REFERENCES ressources(id) ON DELETE CASCADE,
  CONSTRAINT chk_vr_temps CHECK (debut < fin)
);
CREATE INDEX idx_vr_ressource_verrouille_jusqua ON verrous_reservation(ressource_id, verrouille_jusqua);

-- 8) Paiements
DROP TABLE IF EXISTS paiements;
CREATE TABLE paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NULL,
  montant DECIMAL(10,2) NOT NULL,
  methode VARCHAR(50),
  statut ENUM('en_attente','paye','echoue','rembourse') NOT NULL DEFAULT 'en_attente',
  reference_fournisseur VARCHAR(255),
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_paie_res FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
);
