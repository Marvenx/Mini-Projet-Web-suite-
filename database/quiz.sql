-- =====================================================
-- Base de données Quiz - quiz_db
-- =====================================================
-- Créer cette base de données dans phpMyAdmin ou via MySQL CLI
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS quiz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE quiz_db;

-- =====================================================
-- Table des questions
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answers JSON NOT NULL,
    correct_index INT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table des scores
-- =====================================================
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL DEFAULT 10,
    time_taken INT NOT NULL,
    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances des requêtes de classement
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_scores_date ON scores(date_played DESC);

-- =====================================================
-- Insertion des questions initiales
-- =====================================================
INSERT INTO questions (question, answers, correct_index, explanation) VALUES
(
    'Quelle est la capitale de la France ?',
    '["Paris", "Lyon", "Marseille", "Toulouse"]',
    0,
    'Paris est la capitale et la plus grande ville de la France.'
),
(
    'Quel est le plus grand océan du monde ?',
    '["Atlantique", "Pacifique", "Indien", "Arctique"]',
    1,
    'L''océan Pacifique est le plus grand océan du monde.'
),
(
    'Combien de côtés a un hexagone ?',
    '["5", "6", "7", "8"]',
    1,
    'Un hexagone a 6 côtés.'
),
(
    'Qui a peint la Joconde ?',
    '["Michel-Ange", "Raphaël", "Léonard de Vinci", "Donatello"]',
    2,
    'La Joconde a été peinte par Léonard de Vinci.'
),
(
    'Quel est le symbole chimique de l''or ?',
    '["Ag", "Au", "Fe", "Cu"]',
    1,
    'Le symbole chimique de l''or est Au (du latin ''aurum'').'
),
(
    'Dans quel pays se trouve la Tour Eiffel ?',
    '["Italie", "Espagne", "France", "Allemagne"]',
    2,
    'La Tour Eiffel se trouve à Paris, en France.'
),
(
    'Quel est le plus grand mammifère du monde ?',
    '["Éléphant", "Girafe", "Baleine bleue", "Rhinocéros"]',
    2,
    'La baleine bleue est le plus grand mammifère du monde.'
),
(
    'Combien de jours y a-t-il dans une année bissextile ?',
    '["365", "366", "364", "367"]',
    1,
    'Une année bissextile a 366 jours (29 jours en février).'
),
(
    'Quel est le plus petit pays du monde ?',
    '["Monaco", "Vatican", "Liechtenstein", "Saint-Marin"]',
    1,
    'Le Vatican est le plus petit pays du monde.'
),
(
    'Qui a écrit ''Les Misérables'' ?',
    '["Alexandre Dumas", "Victor Hugo", "Émile Zola", "Gustave Flaubert"]',
    1,
    'Victor Hugo a écrit ''Les Misérables''.'
);

-- =====================================================
-- Vérification des données
-- =====================================================
-- SELECT * FROM questions;
-- SELECT * FROM scores ORDER BY score DESC, time_taken ASC LIMIT 10;
