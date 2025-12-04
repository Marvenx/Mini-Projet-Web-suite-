<?php
/**
 * API pour récupérer les questions du quiz
 * Endpoint: GET /api/questions.php
 */

require_once 'config.php';

// Seules les requêtes GET sont autorisées
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Méthode non autorisée', 405);
}

// Connexion à la base de données
$pdo = getDBConnection();

if ($pdo === null) {
    sendError('Erreur de connexion à la base de données', 500);
}

try {
    // Récupérer toutes les questions
    $stmt = $pdo->query("SELECT id, question, answers, correct_index, explanation FROM questions");
    $questions = $stmt->fetchAll();
    
    // Transformer les données pour le format attendu par le JavaScript
    $formattedQuestions = [];
    
    foreach ($questions as $q) {
        $formattedQuestions[] = [
            'id' => (int) $q['id'],
            'question' => $q['question'],
            'answers' => json_decode($q['answers'], true),
            'correct' => (int) $q['correct_index'],
            'explanation' => $q['explanation']
        ];
    }
    
    // Envoyer la réponse
    sendJSON([
        'success' => true,
        'totalQuestions' => count($formattedQuestions),
        'questions' => $formattedQuestions
    ]);
    
} catch (PDOException $e) {
    error_log("Erreur lors de la récupération des questions: " . $e->getMessage());
    sendError('Erreur lors de la récupération des questions', 500);
}
?>
