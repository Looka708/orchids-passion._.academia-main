"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Trophy, Flame, Sparkles } from "lucide-react";
import { DailyQuizQuestion, DailyQuizSession } from "@/lib/types/progress";
import { useAuth } from "@/hooks/useAuth";
import { awardXP, updateUserStats, getUserProgress } from "@/lib/progress/progressService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface DailyQuizModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete?: () => void;
}

export default function DailyQuizModal({ open, onOpenChange, onComplete }: DailyQuizModalProps) {
    const { firebaseUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<DailyQuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false);
    const [checkingCompletion, setCheckingCompletion] = useState(true);

    const generateQuiz = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-daily-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: firebaseUser?.uid })
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            const data = await response.json();
            setQuestions(data.questions || []);
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }, [firebaseUser?.uid, onOpenChange]);

    // Check if quiz was already completed today
    useEffect(() => {
        async function checkDailyQuizCompletion() {
            if (open && firebaseUser?.uid) {
                setCheckingCompletion(true);
                try {
                    const progress = await getUserProgress(firebaseUser.uid);
                    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

                    if (progress?.lastDailyQuizDate === today) {
                        setAlreadyCompletedToday(true);
                    } else {
                        setAlreadyCompletedToday(false);
                        if (questions.length === 0) {
                            generateQuiz();
                        }
                    }
                } catch (error) {
                    console.error('Error checking quiz completion:', error);
                    setAlreadyCompletedToday(false);
                }
                setCheckingCompletion(false);
            }
        }

        if (open) {
            checkDailyQuizCompletion();
        }
    }, [open, firebaseUser?.uid, questions.length, generateQuiz]);

    const handleAnswerSelect = (answer: string) => {
        if (!showResult) {
            setSelectedAnswer(answer);
        }
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        // Update question with user answer
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
            ...currentQuestion,
            userAnswer: selectedAnswer,
            isCorrect
        };
        setQuestions(updatedQuestions);

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
        }

        setShowResult(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            // Quiz completed
            completeQuiz();
        }
    };

    const completeQuiz = async () => {
        const finalScore = Math.round((correctAnswers / questions.length) * 100);
        setScore(finalScore);
        setQuizCompleted(true);

        // Award XP based on performance
        const xpEarned = correctAnswers * 10; // 10 XP per correct answer
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            if (firebaseUser?.uid) {
                await awardXP(firebaseUser.uid, xpEarned, 'daily_quiz', {
                    score: finalScore,
                    questionsAnswered: questions.length,
                    correctAnswers
                });

                await updateUserStats(firebaseUser.uid, {
                    questionsAnswered: questions.length,
                    correctAnswers: correctAnswers,
                    quizzesCompleted: 1
                });

                // Update lastDailyQuizDate to prevent multiple attempts today
                const progressRef = doc(db, 'users', firebaseUser.uid, 'progress', 'current');
                await updateDoc(progressRef, {
                    lastDailyQuizDate: today
                });

                // Show celebration for good scores (removed confetti dependency)
            }
        } catch (error) {
            console.error('Error awarding XP:', error);
        }

        if (onComplete) {
            onComplete();
        }
    };

    const handleClose = () => {
        // Reset state
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setQuizCompleted(false);
        setScore(0);
        setCorrectAnswers(0);
        onOpenChange(false);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Flame className="h-6 w-6 text-orange-500" />
                        Daily Quiz Challenge
                    </DialogTitle>
                    <DialogDescription>
                        Answer 10 questions to maintain your streak!
                    </DialogDescription>
                </DialogHeader>

                {checkingCompletion ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Checking quiz availability...</p>
                    </div>
                ) : alreadyCompletedToday ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="text-6xl">✅</div>
                        <h3 className="text-2xl font-bold">Quiz Already Completed!</h3>
                        <div className="text-center space-y-2">
                            <p className="text-muted-foreground">
                                You've already completed today's daily quiz.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Come back tomorrow for a new set of questions!
                            </p>
                            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                    🔥 Keep your streak alive by completing tomorrow's quiz!
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleClose} className="mt-4">
                            Close
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Generating your daily quiz...</p>
                    </div>
                ) : quizCompleted ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="relative">
                            <Trophy className="h-16 w-16 text-yellow-500" />
                            {score >= 70 && (
                                <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                            )}
                        </div>
                        <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-bold text-primary">{score}%</p>
                            <p className="text-muted-foreground">
                                You got {correctAnswers} out of {questions.length} correct
                            </p>
                            <p className="text-sm font-medium text-primary">
                                Earned {correctAnswers * 10} XP! 🎉
                            </p>
                            {score >= 90 && (
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    🌟 Outstanding! You're on fire!
                                </p>
                            )}
                            {score >= 70 && score < 90 && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                    💪 Great job! Keep up the good work!
                                </p>
                            )}
                            {score < 70 && (
                                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                    📚 Keep practicing! You'll do better next time!
                                </p>
                            )}
                        </div>
                        <Button onClick={handleClose} className="mt-4">
                            Close
                        </Button>
                    </div>
                ) : currentQuestion ? (
                    <div className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span>{correctAnswers} correct</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>

                        {/* Question */}
                        <div className="bg-muted/50 p-6 rounded-lg">
                            <h4 className="text-lg font-semibold mb-4">{currentQuestion.questionText}</h4>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrect = option === currentQuestion.correctAnswer;
                                    const showCorrectAnswer = showResult && isCorrect;
                                    const showWrongAnswer = showResult && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(option)}
                                            disabled={showResult}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showCorrectAnswer
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : showWrongAnswer
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                    : isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50'
                                                } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {showCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                                {showWrongAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={handleClose}>
                                Exit Quiz
                            </Button>
                            {!showResult ? (
                                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                                    Submit Answer
                                </Button>
                            ) : (
                                <Button onClick={handleNextQuestion}>
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="text-6xl">🤔</div>
                        <h3 className="text-xl font-bold">No Questions Available</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                            We couldn't generate quiz questions at this time. This might be a temporary issue.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                            <Button onClick={generateQuiz}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
