<?php
/**
 * API pour gérer les scores du quiz
 * Endpoints:
 *   GET  /api/scores.php          - Récupérer le classement
 *   POST /api/scores.php          - Enregistrer un nouveau score
 */

require_once 'config.php';

// Connexion à la base de données
$pdo = getDBConnection();

if ($pdo === null) {
    sendError('Erreur de connexion à la base de données', 500);
}

// Router selon la méthode HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getScores($pdo);
        break;
    case 'POST':
        saveScore($pdo);
        break;
    default:
        sendError('Méthode non autorisée', 405);
}

/**
 * Récupérer le classement des meilleurs scores
 */
function getScores($pdo) {
    try {
        // Paramètre optionnel pour limiter le nombre de résultats
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $limit = min(max($limit, 1), 100); // Entre 1 et 100
        
        $stmt = $pdo->prepare("
            SELECT pseudo, score, total_questions, time_taken, date_played 
            FROM scores 
            ORDER BY score DESC, time_taken ASC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $scores = $stmt->fetchAll();
        
        // Formater les données
        $formattedScores = [];
        foreach ($scores as $index => $s) {
            $formattedScores[] = [
                'rank' => $index + 1,
                'pseudo' => $s['pseudo'],
                'score' => (int) $s['score'],
                'totalQuestions' => (int) $s['total_questions'],
                'time' => (int) $s['time_taken'],
                'date' => $s['date_played'],
                'percentage' => round(($s['score'] / $s['total_questions']) * 100)
            ];
        }
        
        sendJSON([
            'success' => true,
            'count' => count($formattedScores),
            'scores' => $formattedScores
        ]);
        
    } catch (PDOException $e) {
        error_log("Erreur lors de la récupération des scores: " . $e->getMessage());
        sendError('Erreur lors de la récupération des scores', 500);
    }
}

/**
 * Enregistrer un nouveau score
 */
function saveScore($pdo) {
    // Récupérer les données JSON envoyées
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input === null) {
        sendError('Données JSON invalides');
    }
    
    // Validation des champs requis
    if (empty($input['pseudo'])) {
        sendError('Le pseudo est requis');
    }
    
    if (!isset($input['score']) || !is_numeric($input['score'])) {
        sendError('Le score est requis et doit être un nombre');
    }
    
    if (!isset($input['time']) || !is_numeric($input['time'])) {
        sendError('Le temps est requis et doit être un nombre');
    }
    
    // Nettoyer et valider les données
    $pseudo = trim(htmlspecialchars($input['pseudo'], ENT_QUOTES, 'UTF-8'));
    $score = (int) $input['score'];
    $time = (int) $input['time'];
    $totalQuestions = isset($input['totalQuestions']) ? (int) $input['totalQuestions'] : 10;
    
    // Validation supplémentaire
    if (strlen($pseudo) < 2 || strlen($pseudo) > 50) {
        sendError('Le pseudo doit contenir entre 2 et 50 caractères');
    }
    
    if ($score < 0 || $score > $totalQuestions) {
        sendError('Score invalide');
    }
    
    if ($time < 0 || $time > 3600) {
        sendError('Temps invalide');
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO scores (pseudo, score, total_questions, time_taken) 
            VALUES (:pseudo, :score, :total, :time)
        ");
        
        $stmt->execute([
            ':pseudo' => $pseudo,
            ':score' => $score,
            ':total' => $totalQuestions,
            ':time' => $time
        ]);
        
        $newId = $pdo->lastInsertId();
        
        // Récupérer le rang du nouveau score
        $rankStmt = $pdo->prepare("
            SELECT COUNT(*) + 1 as rank 
            FROM scores 
            WHERE score > :score OR (score = :score AND time_taken < :time)
        ");
        $rankStmt->execute([':score' => $score, ':time' => $time]);
        $rankResult = $rankStmt->fetch();
        
        sendJSON([
            'success' => true,
            'message' => 'Score enregistré avec succès',
            'data' => [
                'id' => (int) $newId,
                'pseudo' => $pseudo,
                'score' => $score,
                'time' => $time,
                'rank' => (int) $rankResult['rank']
            ]
        ], 201);
        
    } catch (PDOException $e) {
        error_log("Erreur lors de l'enregistrement du score: " . $e->getMessage());
        sendError('Erreur lors de l\'enregistrement du score', 500);
    }
}
?>
