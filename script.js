const QUIZ_CONFIG = {
    totalQuestions: 10,
    timePerQuestion: 30,
    questions: [
        {
            question: "Quelle est la capitale de la France ?",
            answers: ["Paris", "Lyon", "Marseille", "Toulouse"],
            correct: 0,
            explanation: "Paris est la capitale et la plus grande ville de la France."
        },
        {
            question: "Quel est le plus grand océan du monde ?",
            answers: ["Atlantique", "Pacifique", "Indien", "Arctique"],
            correct: 1,
            explanation: "L'océan Pacifique est le plus grand océan du monde."
        },
        {
            question: "Combien de côtés a un hexagone ?",
            answers: ["5", "6", "7", "8"],
            correct: 1,
            explanation: "Un hexagone a 6 côtés."
        },
        {
            question: "Qui a peint la Joconde ?",
            answers: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Donatello"],
            correct: 2,
            explanation: "La Joconde a été peinte par Léonard de Vinci."
        },
        {
            question: "Quel est le symbole chimique de l'or ?",
            answers: ["Ag", "Au", "Fe", "Cu"],
            correct: 1,
            explanation: "Le symbole chimique de l'or est Au (du latin 'aurum')."
        },
        {
            question: "Dans quel pays se trouve la Tour Eiffel ?",
            answers: ["Italie", "Espagne", "France", "Allemagne"],
            correct: 2,
            explanation: "La Tour Eiffel se trouve à Paris, en France."
        },
        {
            question: "Quel est le plus grand mammifère du monde ?",
            answers: ["Éléphant", "Girafe", "Baleine bleue", "Rhinocéros"],
            correct: 2,
            explanation: "La baleine bleue est le plus grand mammifère du monde."
        },
        {
            question: "Combien de jours y a-t-il dans une année bissextile ?",
            answers: ["365", "366", "364", "367"],
            correct: 1,
            explanation: "Une année bissextile a 366 jours (29 jours en février)."
        },
        {
            question: "Quel est le plus petit pays du monde ?",
            answers: ["Monaco", "Vatican", "Liechtenstein", "Saint-Marin"],
            correct: 1,
            explanation: "Le Vatican est le plus petit pays du monde."
        },
        {
            question: "Qui a écrit 'Les Misérables' ?",
            answers: ["Alexandre Dumas", "Victor Hugo", "Émile Zola", "Gustave Flaubert"],
            correct: 1,
            explanation: "Victor Hugo a écrit 'Les Misérables'."
        }
    ]
};

class QuizState {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.timeLeft = QUIZ_CONFIG.timePerQuestion;
        this.timer = null;
        this.startTime = null;
        this.selectedAnswer = null;
        this.quizCompleted = false;
        this.questions = [];
        this.answeredQuestions = [];
        this.autoAdvanceTimer = null;
    }

    reset() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.timeLeft = QUIZ_CONFIG.timePerQuestion;
        this.selectedAnswer = null;
        this.quizCompleted = false;
        this.questions = [];
        this.answeredQuestions = [];
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
    }
}

const quizState = new QuizState();

const elements = {
    homePage: document.getElementById('home-page'),
    quizPage: document.getElementById('quiz-page'),
    resultsPage: document.getElementById('results-page'),
    historyPage: document.getElementById('history-page'),
    startQuiz: document.getElementById('start-quiz'),
    viewHistory: document.getElementById('view-history'),
    backFromHistory: document.getElementById('back-from-history'),
    nextQuestion: document.getElementById('next-question'),
    restartQuiz: document.getElementById('restart-quiz'),
    backHome: document.getElementById('back-home'),
    questionText: document.getElementById('question-text'),
    answersContainer: document.getElementById('answers-container'),
    questionCounter: document.getElementById('question-counter'),
    progress: document.getElementById('progress'),
    timer: document.getElementById('timer'),
    finalScore: document.getElementById('final-score'),
    scoreMessage: document.getElementById('score-message'),
    scoreDescription: document.getElementById('score-description'),
    correctAnswers: document.getElementById('correct-answers'),
    wrongAnswers: document.getElementById('wrong-answers'),
    timeTaken: document.getElementById('time-taken'),
    questionReview: document.getElementById('question-review'),
    reviewList: document.getElementById('review-list'),
    scoreHistory: document.getElementById('score-history'),
    historyList: document.getElementById('history-list'),
    homeHistoryList: document.getElementById('home-history-list'),
    feedback: document.getElementById('feedback'),
    feedbackIcon: document.querySelector('.feedback-icon'),
    feedbackMessage: document.querySelector('.feedback-message'),
    abortQuiz: document.getElementById('abort-quiz'),
    abortModal: document.getElementById('abort-modal'),
    confirmAbort: document.getElementById('confirm-abort'),
    cancelAbort: document.getElementById('cancel-abort'),
    progressIndicator: document.getElementById('progress-indicator')
};

function initializeEventListeners() {
    elements.startQuiz.addEventListener('click', startQuiz);
    elements.viewHistory.addEventListener('click', showHistoryPage);
    elements.backFromHistory.addEventListener('click', backToHome);
    elements.nextQuestion.addEventListener('click', nextQuestion);
    elements.restartQuiz.addEventListener('click', restartQuiz);
    elements.backHome.addEventListener('click', backToHome);
    elements.abortQuiz.addEventListener('click', showAbortModal);
    elements.confirmAbort.addEventListener('click', abortQuiz);
    elements.cancelAbort.addEventListener('click', hideAbortModal);
    document.addEventListener('keydown', handleKeyboard);
    elements.abortModal.addEventListener('click', (e) => {
        if (e.target === elements.abortModal) {
            hideAbortModal();
        }
    });
}

function handleKeyboard(event) {
    if (elements.quizPage.classList.contains('active')) {
        const key = event.key;
        if (key >= '1' && key <= '4') {
            const answerIndex = parseInt(key) - 1;
            const answers = elements.answersContainer.querySelectorAll('.answer-option');
            if (answers[answerIndex]) {
                selectAnswer(answerIndex);
            }
        }
        if (key === 'Enter' && !elements.nextQuestion.disabled) {
            nextQuestion();
        }
        if (key === 'Escape') {
            showAbortModal();
        }
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function startQuiz() {
    quizState.reset();
    quizState.startTime = Date.now();
    quizState.questions = [...QUIZ_CONFIG.questions];
    shuffleArray(quizState.questions);
    showPage('quiz-page');
    loadQuestion();
    startTimer();
    updateProgressIndicator();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
    const question = quizState.questions[quizState.currentQuestion];
    elements.questionText.textContent = question.question;
    elements.questionCounter.textContent = `Question ${quizState.currentQuestion + 1}/${QUIZ_CONFIG.totalQuestions}`;
    const progressPercentage = ((quizState.currentQuestion + 1) / QUIZ_CONFIG.totalQuestions) * 100;
    elements.progress.style.width = `${progressPercentage}%`;
    generateAnswers(question);
    quizState.selectedAnswer = null;
    elements.nextQuestion.disabled = true;
    updateProgressIndicator();
    if (quizState.autoAdvanceTimer) {
        clearTimeout(quizState.autoAdvanceTimer);
        quizState.autoAdvanceTimer = null;
    }
}

function generateAnswers(question) {
    elements.answersContainer.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement('button');
        answerElement.className = 'answer-option';
        answerElement.textContent = answer;
        answerElement.setAttribute('data-index', index);
        answerElement.setAttribute('aria-label', `Réponse ${index + 1}: ${answer}`);
        answerElement.addEventListener('click', () => selectAnswer(index));
        elements.answersContainer.appendChild(answerElement);
    });
}

function selectAnswer(answerIndex) {
    if (quizState.selectedAnswer !== null) return;
    quizState.selectedAnswer = answerIndex;
    const answerElements = elements.answersContainer.querySelectorAll('.answer-option');
    answerElements.forEach((element, index) => {
        element.classList.remove('selected');
        if (index === answerIndex) {
            element.classList.add('selected');
        }
    });
    elements.nextQuestion.disabled = false;
    clearInterval(quizState.timer);
    setTimeout(() => {
        checkAnswer(answerIndex);
    }, 500);
}

function checkAnswer(selectedIndex) {
    const question = quizState.questions[quizState.currentQuestion];
    const isCorrect = selectedIndex === question.correct;
    if (isCorrect) {
        quizState.score++;
        quizState.correctAnswers++;
        const timeBonus = Math.floor(quizState.timeLeft / 5);
        quizState.score += timeBonus;
    } else {
        quizState.wrongAnswers++;
    }
    quizState.answeredQuestions.push({
        question: question.question,
        answers: question.answers,
        correctIndex: question.correct,
        selectedIndex: selectedIndex,
        isCorrect: isCorrect,
        explanation: question.explanation,
        questionNumber: quizState.currentQuestion + 1
    });
    showAnswerFeedback(isCorrect, question);
    updateAnswerDisplay(selectedIndex, question.correct);
    elements.nextQuestion.disabled = false;
    updateProgressIndicator();
    if (quizState.autoAdvanceTimer) {
        clearTimeout(quizState.autoAdvanceTimer);
    }
    quizState.autoAdvanceTimer = setTimeout(() => {
        if (!elements.nextQuestion.disabled && quizState.currentQuestion < QUIZ_CONFIG.totalQuestions) {
            nextQuestion();
        }
    }, 3000);
}

function showAnswerFeedback(isCorrect, question) {
    const feedback = elements.feedback;
    const icon = elements.feedbackIcon;
    const message = elements.feedbackMessage;
    feedback.className = `feedback ${isCorrect ? 'success' : 'error'}`;
    icon.textContent = isCorrect ? '✓' : '✗';
    message.textContent = isCorrect ? 'Correct !' : 'Incorrect';
    feedback.classList.remove('hidden');
    setTimeout(() => {
        feedback.classList.add('hidden');
    }, 2000);
}

function updateAnswerDisplay(selectedIndex, correctIndex) {
    const answerElements = elements.answersContainer.querySelectorAll('.answer-option');
    answerElements.forEach((element, index) => {
        element.style.pointerEvents = 'none';
        if (index === correctIndex) {
            element.classList.add('correct');
        } else if (index === selectedIndex && index !== correctIndex) {
            element.classList.add('incorrect');
        }
    });
}

function nextQuestion() {
    if (quizState.autoAdvanceTimer) {
        clearTimeout(quizState.autoAdvanceTimer);
        quizState.autoAdvanceTimer = null;
    }
    quizState.currentQuestion++;
    if (quizState.currentQuestion >= QUIZ_CONFIG.totalQuestions) {
        finishQuiz();
    } else {
        loadQuestion();
        startTimer();
    }
}

function finishQuiz() {
    quizState.quizCompleted = true;
    clearInterval(quizState.timer);
    if (quizState.autoAdvanceTimer) {
        clearTimeout(quizState.autoAdvanceTimer);
        quizState.autoAdvanceTimer = null;
    }
    const totalTime = Math.floor((Date.now() - quizState.startTime) / 1000);
    saveScore(quizState.correctAnswers, totalTime);
    showResults(totalTime);
}

function showResults(totalTime) {
    showPage('results-page');
    elements.finalScore.textContent = quizState.correctAnswers;
    elements.correctAnswers.textContent = quizState.correctAnswers;
    elements.wrongAnswers.textContent = quizState.wrongAnswers;
    elements.timeTaken.textContent = `${totalTime}s`;
    const percentage = Math.round((quizState.correctAnswers / QUIZ_CONFIG.totalQuestions) * 100);
    let message, description;
    if (percentage >= 90) {
        message = "Excellent ! 🎉";
        description = "Vous avez obtenu un score exceptionnel !";
    } else if (percentage >= 70) {
        message = "Très bien ! 👏";
        description = "Bonne performance, continuez comme ça !";
    } else if (percentage >= 50) {
        message = "Pas mal ! 👍";
        description = "Vous pouvez encore vous améliorer !";
    } else {
        message = "À améliorer 📚";
        description = "Relisez vos cours et réessayez !";
    }
    elements.scoreMessage.textContent = message;
    elements.scoreDescription.textContent = description;
    displayQuestionReview();
    displayScoreHistory();
}

function startTimer() {
    quizState.timeLeft = QUIZ_CONFIG.timePerQuestion;
    updateTimerDisplay();
    quizState.timer = setInterval(() => {
        quizState.timeLeft--;
        updateTimerDisplay();
        if (quizState.timeLeft <= 0) {
            clearInterval(quizState.timer);
            handleTimeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    elements.timer.textContent = quizState.timeLeft;
    elements.timer.className = 'timer';
    if (quizState.timeLeft <= 5) {
        elements.timer.classList.add('danger');
    } else if (quizState.timeLeft <= 10) {
        elements.timer.classList.add('warning');
    }
}

function handleTimeUp() {
    if (quizState.selectedAnswer === null) {
        const question = quizState.questions[quizState.currentQuestion];
        quizState.wrongAnswers++;
        quizState.answeredQuestions.push({
            question: question.question,
            answers: question.answers,
            correctIndex: question.correct,
            selectedIndex: null,
            isCorrect: false,
            explanation: question.explanation,
            questionNumber: quizState.currentQuestion + 1
        });
        showAnswerFeedback(false, question);
        elements.nextQuestion.disabled = false;
        updateProgressIndicator();
        if (quizState.autoAdvanceTimer) {
            clearTimeout(quizState.autoAdvanceTimer);
        }
        quizState.autoAdvanceTimer = setTimeout(() => {
            if (!elements.nextQuestion.disabled && quizState.currentQuestion < QUIZ_CONFIG.totalQuestions) {
                nextQuestion();
            }
        }, 3000);
    }
}

function restartQuiz() {
    quizState.reset();
    showPage('home-page');
}

function backToHome() {
    showPage('home-page');
}

function showAbortModal() {
    elements.abortModal.classList.remove('hidden');
}

function hideAbortModal() {
    elements.abortModal.classList.add('hidden');
}

function abortQuiz() {
    if (quizState.timer) {
        clearInterval(quizState.timer);
        quizState.timer = null;
    }
    quizState.reset();
    hideAbortModal();
    showPage('home-page');
}

function updateProgressIndicator() {
    const answered = quizState.answeredQuestions.length;
    elements.progressIndicator.textContent = `Répondu: ${answered}/${QUIZ_CONFIG.totalQuestions}`;
}

function showHistoryPage() {
    showPage('history-page');
    displayHomeHistory();
}

function displayHomeHistory() {
    const scores = loadScores();
    elements.homeHistoryList.innerHTML = '';
    if (scores.length === 0) {
        elements.homeHistoryList.innerHTML = '<p style="text-align: center; color: white; padding: 2rem;">Aucun score enregistré.</p>';
        return;
    }
    const recentScores = scores.slice(0, 10);
    recentScores.forEach((scoreData, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        const date = new Date(scoreData.date);
        const dateStr = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const percentage = Math.round((scoreData.score / QUIZ_CONFIG.totalQuestions) * 100);
        historyItem.innerHTML = `
            <div class="history-rank">#${index + 1}</div>
            <div class="history-details">
                <div class="history-score">${scoreData.score}/${QUIZ_CONFIG.totalQuestions} (${percentage}%)</div>
                <div class="history-time">Temps: ${scoreData.time}s</div>
                <div class="history-date">${dateStr}</div>
            </div>
        `;
        elements.homeHistoryList.appendChild(historyItem);
    });
}

function displayQuestionReview() {
    elements.reviewList.innerHTML = '';
    
    if (quizState.answeredQuestions.length === 0) {
        elements.reviewList.innerHTML = '<p>Aucune question répondue.</p>';
        return;
    }
    
    quizState.answeredQuestions.forEach((item, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
        
        reviewItem.innerHTML = `
            <div class="review-header">
                <span class="review-number">Question ${item.questionNumber}</span>
                <span class="review-status">${item.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
            </div>
            <div class="review-question">${item.question}</div>
            <div class="review-answers">
                <div class="review-answer ${item.selectedIndex === item.correctIndex ? 'correct-answer' : ''}">
                    <strong>Votre réponse:</strong> ${item.selectedIndex !== null ? item.answers[item.selectedIndex] : 'Aucune réponse'}
                </div>
                ${!item.isCorrect ? `
                    <div class="review-answer correct-answer">
                        <strong>Réponse correcte:</strong> ${item.answers[item.correctIndex]}
                    </div>
                ` : ''}
            </div>
            <div class="review-explanation">
                <strong>Explication:</strong> ${item.explanation}
            </div>
        `;
        
        elements.reviewList.appendChild(reviewItem);
    });
}

function displayScoreHistory() {
    const scores = loadScores();
    elements.historyList.innerHTML = '';
    if (scores.length === 0) {
        elements.historyList.innerHTML = '<p>Aucun score enregistré.</p>';
        return;
    }
    const recentScores = scores.slice(0, 10);
    recentScores.forEach((scoreData, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        const date = new Date(scoreData.date);
        const dateStr = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const percentage = Math.round((scoreData.score / QUIZ_CONFIG.totalQuestions) * 100);
        historyItem.innerHTML = `
            <div class="history-rank">#${index + 1}</div>
            <div class="history-details">
                <div class="history-score">${scoreData.score}/${QUIZ_CONFIG.totalQuestions} (${percentage}%)</div>
                <div class="history-time">Temps: ${scoreData.time}s</div>
                <div class="history-date">${dateStr}</div>
            </div>
        `;
        elements.historyList.appendChild(historyItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    showPage('home-page');
    addLoadingEffects();
});

function addLoadingEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0.1s';
                entry.target.style.animationFillMode = 'both';
            }
        });
    });
    document.querySelectorAll('.info-card').forEach(card => {
        observer.observe(card);
    });
}

window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    if (elements.feedback) {
        elements.feedback.className = 'feedback error';
        elements.feedbackIcon.textContent = '⚠️';
        elements.feedbackMessage.textContent = 'Une erreur est survenue';
        elements.feedback.classList.remove('hidden');
        setTimeout(() => {
            elements.feedback.classList.add('hidden');
        }, 3000);
    }
});

function saveScore(score, time) {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    scores.push({
        score: score,
        time: time,
        date: new Date().toISOString()
    });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10);
    localStorage.setItem('quizScores', JSON.stringify(scores));
}

function loadScores() {
    return JSON.parse(localStorage.getItem('quizScores') || '[]');
}
