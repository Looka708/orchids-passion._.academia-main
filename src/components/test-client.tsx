
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, AlertTriangle, Timer } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { MCQ } from "@/lib/types";
import { cn } from "@/lib/utils";
import Confetti from "./confetti";
import VideoSuggestionWrapper from "./video/VideoSuggestionWrapper";

const isUrdu = (text: string | null | undefined) => /[\u0600-\u06FF]/.test(text || "");

interface TestClientProps {
  grade: number | string;
  subject: string;
  chapterTitle: string;
  chapterMcqs: MCQ[];
  basePath: string;
  showVideoSuggestions?: boolean; // Enable video sidebar
}


export default function TestClient({ grade, subject, chapterTitle, chapterMcqs, basePath, showVideoSuggestions = true }: TestClientProps) {
  const [testStarted, setTestStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(0);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);

  useEffect(() => {
    if (chapterMcqs.length > 0) {
      setNumQuestions(chapterMcqs.length);
    }
  }, [chapterMcqs]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(17);

  // Define functions before useEffect
  const normalizeAnswer = (text: string | null | undefined) => {
    return text?.toString().trim().toLowerCase() || '';
  };

  const handleSubmit = useCallback(() => {
    let correctAnswers = 0;
    mcqs.forEach((mcq, index) => {
      const selectedIdx = selectedAnswers[index];
      if (selectedIdx !== undefined) {
        const selectedValue = getOptionValue(mcq.options[parseInt(selectedIdx)]);
        if (normalizeAnswer(selectedValue) === normalizeAnswer(mcq.correctAnswer)) {
          correctAnswers++;
        }
      }
    });
    const finalScore = (correctAnswers / mcqs.length) * 100;
    setScore(finalScore);
    if (finalScore >= 70) {
      setShowConfetti(true);
    }
    setSubmitted(true);
  }, [mcqs, selectedAnswers]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(17); // Reset timer for next question
    } else {
      handleSubmit(); // Auto-submit if it's the last question
    }
  }, [currentQuestionIndex, mcqs.length, handleSubmit]);

  useEffect(() => {
    if (testStarted && !submitted) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        handleNext(); // Auto-move to next question when time is up
      }
    }
  }, [testStarted, submitted, timeLeft, handleNext]);

  const startTest = () => {
    if (chapterMcqs.length > 0) {
      // Deduplicate questions by text and options
      const uniqueSource = chapterMcqs.filter((mcq, index, self) =>
        index === self.findIndex((m) => (
          (m.questionText === mcq.questionText) &&
          JSON.stringify(m.options) === JSON.stringify(mcq.options)
        ))
      );

      const shuffled = [...uniqueSource].sort(() => 0.5 - Math.random());
      const selectedNumQuestions = Math.min(numQuestions, shuffled.length);

      // Clean up duplicate options within EACH question
      const cleaned = shuffled.slice(0, selectedNumQuestions).map(mcq => ({
        ...mcq,
        options: Array.from(new Set(mcq.options.map(opt => typeof opt === 'string' ? opt : JSON.stringify(opt))))
          .map(opt => {
            try { return JSON.parse(opt); } catch (e) { return opt; }
          })
      }));

      setMcqs(cleaned);
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setSubmitted(false);
      setScore(0);
      setShowConfetti(false);
      setTimeLeft(17);
    }
  };

  const handleOptionChange = (questionIndex: number, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const getOptionValue = (option: string | { label: string; svg: string }) => {
    return typeof option === 'string' ? option : option.label;
  };


  if (!chapterMcqs || chapterMcqs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no questions available for this chapter yet. Please check back later or contact an administrator to add content.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="mx-auto">
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Start Test</CardTitle>
            <CardDescription>
              {`You are about to start a test on ${subject}: ${chapterTitle}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="num-questions" className="text-lg font-semibold">Number of Questions: {numQuestions}</Label>
              <Slider
                id="num-questions"
                min={1}
                max={chapterMcqs.length}
                step={1}
                value={[numQuestions]}
                onValueChange={(value) => setNumQuestions(value[0])}
                className="mt-4"
              />
            </div>
            <Button onClick={startTest} size="lg">Begin Test</Button>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="mx-auto">
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 relative">
        {showConfetti && <Confetti />}
        <Card className="max-w-3xl mx-auto overflow-hidden">
          {score < 40 && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
              <div className="stamp-animation text-9xl font-bold text-red-500/30 border-4 border-red-500/30 rounded-lg p-8 transform -rotate-12 -translate-y-4 opacity-0">
                FAIL
              </div>
            </div>
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Test Results</CardTitle>
            <CardDescription>
              You scored <span className="font-bold text-primary">{score.toFixed(0)}%</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full w-full flex-1 bg-primary transition-all"
                style={{ transform: `translateX(-${100 - score}%)` }}
              />
            </div>
            {mcqs.map((mcq, index) => {
              const userAnswer = selectedAnswers[index];
              // Use normalizeAnswer inside the rendering loop comparison as well
              const userAnswerValue = userAnswer !== undefined ? getOptionValue(mcq.options[parseInt(userAnswer)]) : "";
              const isCorrect = normalizeAnswer(userAnswerValue) === normalizeAnswer(mcq.correctAnswer);

              return (
                <div key={mcq.id} className="border p-4 rounded-md">
                  {mcq.questionImage && (
                    <div className="mb-4 flex justify-center" dangerouslySetInnerHTML={{ __html: mcq.questionImage }} />
                  )}
                  {mcq.questionText && <p className={cn("font-semibold", (mcq.language === 'urdu' || isUrdu(mcq.questionText)) ? 'font-urdu text-2xl text-right leading-relaxed mb-2' : '')}>{`${index + 1}. ${mcq.questionText}`}</p>}

                  <div className={cn("mt-2 text-sm space-y-1", (mcq.language === 'urdu' || isUrdu(mcq.questionText)) ? 'font-urdu text-xl text-right' : '')}>
                    {(() => {
                      const selectedIdx = selectedAnswers[index];
                      const userAnswer = selectedIdx !== undefined ? getOptionValue(mcq.options[parseInt(selectedIdx)]) : "";
                      return (
                        <>
                          <p className={cn("flex items-center gap-2", (mcq.language === 'urdu' || isUrdu(mcq.questionText)) ? 'flex-row-reverse' : '', isCorrect ? 'text-green-600' : 'text-red-600')}>
                            <span>{isUrdu(userAnswer) || mcq.language === 'urdu' ? 'آپ کا جواب:' : 'Your answer:'} {userAnswer || (mcq.language === 'urdu' ? "جواب نہیں دیا" : "Not answered")}</span>
                            {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </p>
                          {!isCorrect && <p className="text-green-600">
                            {isUrdu(mcq.correctAnswer) || mcq.language === 'urdu' ? 'صحیح جواب:' : 'Correct answer:'} {mcq.correctAnswer}
                          </p>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="flex-col sm:flex-row justify-center gap-4">
            <Button onClick={startTest}>
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subject
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentMcq = mcqs[currentQuestionIndex];
  return (
    <div className="container mx-auto px-4 py-12">
      <div className={cn(
        "grid gap-6",
        showVideoSuggestions ? "grid-cols-1 lg:grid-cols-[1fr_400px]" : "grid-cols-1"
      )}>
        {/* Quiz Card */}
        <Card className="max-w-3xl mx-auto w-full">
          <CardHeader>
            <Progress value={(currentQuestionIndex + 1) / mcqs.length * 100} className="mb-4" />
            <div className="flex justify-between items-center">
              <CardTitle className={cn("text-xl", (currentMcq.language === 'urdu' || isUrdu(currentMcq.questionText)) ? 'font-urdu text-2xl text-right' : '')}>
                {`Question ${currentQuestionIndex + 1} of ${mcqs.length}`}
              </CardTitle>
              <div className="flex items-center gap-2 font-bold text-lg">
                <Timer className="h-6 w-6" />
                <span>{timeLeft}s</span>
              </div>
            </div>
            {currentMcq.questionText && <CardDescription className={cn("pt-4 text-lg", (currentMcq.language === 'urdu' || isUrdu(currentMcq.questionText)) ? 'font-urdu text-xl text-right' : '')}>
              {currentMcq.questionText}
            </CardDescription>}
            {currentMcq.questionImage && (
              <div className="pt-4 flex justify-center" dangerouslySetInnerHTML={{ __html: currentMcq.questionImage }} />
            )}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]}
              onValueChange={(value) => handleOptionChange(currentQuestionIndex, value)}
              className="space-y-2"
            >
              <div className={cn("grid gap-4", currentMcq.options.some(opt => typeof opt !== 'string') ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1')}>
                {currentMcq.options.map((option, idx) => {
                  const optionIdxString = idx.toString();
                  const optionId = `${currentMcq.id}-opt-${idx}`;
                  const isOptionSelected = selectedAnswers[currentQuestionIndex] === optionIdxString;
                  const isOptionUrdu = typeof option === 'string' && isUrdu(option);
                  const isUrduMcq = currentMcq.language === 'urdu' || isUrdu(currentMcq.questionText);

                  return (
                    <div
                      key={optionId}
                      className={cn(
                        "flex items-center rounded-md border border-input p-3 transition-all hover:bg-accent/50",
                        isOptionSelected ? 'bg-primary/10 border-primary ring-1 ring-primary' : '',
                        (isUrduMcq || isOptionUrdu) ? 'flex-row-reverse space-x-reverse' : ''
                      )}
                    >
                      <RadioGroupItem value={optionIdxString} id={optionId} className={cn((isUrduMcq || isOptionUrdu) ? 'ml-2' : 'mr-2')} />
                      <Label
                        htmlFor={optionId}
                        className={cn(
                          "flex w-full cursor-pointer py-1",
                          (isUrduMcq || isOptionUrdu) ? 'justify-end text-right' : 'justify-start text-left',
                          typeof option !== 'string' ? 'flex-col items-center justify-center' : 'items-center'
                        )}
                      >
                        {typeof option === 'string' ? (
                          <span className={cn((isUrduMcq || isUrdu(option)) ? 'font-urdu text-xl leading-relaxed' : 'text-base')}>
                            {option}
                          </span>
                        ) : (
                          <>
                            <div dangerouslySetInnerHTML={{ __html: option.svg }} />
                            <span className="mt-2 font-semibold">{option.label}</span>
                          </>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end">
            {currentQuestionIndex === mcqs.length - 1 ? (
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Video Sidebar */}
        {showVideoSuggestions && (
          <div className="lg:block">
            <VideoSuggestionWrapper
              subject={subject}
              grade={grade}
              chapterName={chapterTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
