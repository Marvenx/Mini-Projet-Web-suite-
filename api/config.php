<?php
/**
 * Configuration de la base de données
 * Quiz Interactif - PHP/MySQL
 */

// Paramètres de connexion à la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'quiz_db');
define('DB_USER', 'root');
define('DB_PASS', ''); // Mot de passe vide par défaut sur XAMPP

// Configuration des headers pour les requêtes AJAX (CORS)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Connexion à la base de données avec PDO
 * @return PDO|null Instance PDO ou null en cas d'erreur
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
        
    } catch (PDOException $e) {
        // En production, ne pas afficher les détails de l'erreur
        error_log("Erreur de connexion DB: " . $e->getMessage());
        return null;
    }
}

/**
 * Envoie une réponse JSON
 * @param mixed $data Données à envoyer
 * @param int $statusCode Code HTTP
 */
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Envoie une erreur JSON
 * @param string $message Message d'erreur
 * @param int $statusCode Code HTTP
 */
function sendError($message, $statusCode = 400) {
    sendJSON(['success' => false, 'error' => $message], $statusCode);
}
?>
