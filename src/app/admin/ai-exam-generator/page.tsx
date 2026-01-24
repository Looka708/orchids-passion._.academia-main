"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { MCQ } from "@/lib/types";
import { FileDown, Printer, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type GeneratedExam = {
    mcqs: MCQ[];
    shortQuestions: string[];
    longQuestions: string[];
};

interface CourseStructure {
    course_type: string;
    subjects: {
        name: string;
        chapters: { name: string; count: number }[];
    }[];
}

export default function AIExamGeneratorPage() {
    const { toast } = useToast();
    const [structure, setStructure] = useState<CourseStructure[]>([]);
    const [loadingStructure, setLoadingStructure] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

    useEffect(() => {
        const loadStructure = async () => {
            try {
                const res = await fetch("/api/mcqs/structure");
                const data = await res.json();
                if (data.success) {
                    setStructure(data.structure);
                }
            } catch (error) {
                console.error("Failed to load structure", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load course data" });
            } finally {
                setLoadingStructure(false);
            }
        };
        loadStructure();
    }, []);

    const [numMcqs, setNumMcqs] = useState(30);
    const [numShortQuestions, setNumShortQuestions] = useState(15);
    const [numLongQuestions, setNumLongQuestions] = useState(10);
    const [customLongQuestions, setCustomLongQuestions] = useState("");

    const [examTitle, setExamTitle] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [duration, setDuration] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [showAnswerKey, setShowAnswerKey] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);

    const handleCourseChange = (value: string) => {
        setSelectedCourse(value);
        setSelectedSubject("");
        setSelectedChapters([]);
        setGeneratedExam(null);
    };

    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        setSelectedChapters([]);
        setGeneratedExam(null);
    };

    const handleChapterToggle = (chapter: string) => {
        setSelectedChapters(prev =>
            prev.includes(chapter)
                ? prev.filter(c => c !== chapter)
                : [...prev, chapter]
        );
        setGeneratedExam(null);
    };

    const currentCourse = structure.find(c => c.course_type === selectedCourse);
    const currentSubject = currentCourse?.subjects.find(s => s.name === selectedSubject);
    const subjectChapters = currentSubject?.chapters.map(ch => ch.name) || [];

    const handleGenerateWithAI = async () => {
        if (!selectedCourse || !selectedSubject || selectedChapters.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select course, subject, and at least one chapter",
            });
            return;
        }

        setIsGeneratingAI(true);
        try {
            const response = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    course: selectedCourse,
                    subject: selectedSubject,
                    chapters: selectedChapters,
                    numMcqs,
                    numShortQuestions,
                    numLongQuestions,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('API Error Response:', error);
                console.error('Status:', error.status, error.statusText);
                console.error('Details:', error.details);

                throw new Error(
                    error.details
                        ? `${error.error}: ${error.details}`
                        : error.error || 'Failed to generate questions'
                );
            }

            const data = await response.json();

            // Add custom long questions if any
            let finalLongQuestions = Array.isArray(data.longQuestions) ? data.longQuestions : [];
            if (customLongQuestions && typeof customLongQuestions === 'string' && customLongQuestions.trim() !== "") {
                const customQuestions = customLongQuestions
                    .trim()
                    .split('\n')
                    .map(q => q.trim())
                    .filter(q => q !== '');
                finalLongQuestions = [...finalLongQuestions, ...customQuestions];
            }

            setGeneratedExam({
                mcqs: data.mcqs || [],
                shortQuestions: data.shortQuestions || [],
                longQuestions: finalLongQuestions,
            });

            // Show success message with details
            const actualMcqs = data.mcqs?.length || 0;
            const actualShorts = data.shortQuestions?.length || 0;
            const actualLongs = finalLongQuestions.length;

            // Check if we have warnings from the API
            const hasWarnings = data.metadata?.warnings && data.metadata.warnings.length > 0;

            toast({
                title: hasWarnings ? "Questions Generated with Warnings" : "Success!",
                description: hasWarnings
                    ? `Generated ${actualMcqs} MCQs, ${actualShorts} short questions, and ${actualLongs} long questions. ${data.metadata.warnings.join('. ')}`
                    : `Generated ${actualMcqs} MCQs, ${actualShorts} short questions, and ${actualLongs} long questions.`,
                variant: hasWarnings ? "destructive" : "default",
            });
        } catch (error: any) {
            console.error('Error generating with AI:', error);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));

            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: error.message || "Failed to generate questions with AI. Please check the console for details.",
                duration: 10000, // Show for 10 seconds
            });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                toast({
                    variant: "destructive",
                    title: "Invalid File",
                    description: "Please upload an image file",
                });
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <ProtectedRoute examGeneratorOnly={true}>
            <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center bg-muted/40 p-4 md:p-8">
                <div className="grid w-full max-w-5xl gap-8">
                    <Card className="no-print border-purple-200 dark:border-purple-800">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">AI Exam Generator</CardTitle>
                                        <CardDescription className="mt-1">
                                            Generate custom exam questions using artificial intelligence
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href="/admin/exam-generator">
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Database Generator
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6 mt-6">
                            {/* Course and Subject Selection */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <Label>Course</Label>
                                    <Select onValueChange={handleCourseChange} value={selectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingStructure ? (
                                                <div className="flex items-center justify-center p-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                structure.map(course => (
                                                    <SelectItem key={course.course_type} value={course.course_type}>
                                                        {course.course_type.toUpperCase()}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedCourse && (
                                    <div className="space-y-4">
                                        <Label>Subject</Label>
                                        <Select onValueChange={handleSubjectChange} value={selectedSubject} disabled={!selectedCourse}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a Subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currentCourse?.subjects.map(subject => (
                                                    <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Multi-Chapter Selection */}
                            {selectedSubject && subjectChapters.length > 0 && (
                                <div className="space-y-4">
                                    <Label>Select Chapters (Multiple)</Label>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 border rounded-lg p-4 max-h-60 overflow-y-auto">
                                        {subjectChapters.map(chapter => (
                                            <div key={chapter} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`chapter-${chapter}`}
                                                    checked={selectedChapters.includes(chapter)}
                                                    onCheckedChange={() => handleChapterToggle(chapter)}
                                                />
                                                <label
                                                    htmlFor={`chapter-${chapter}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {chapter}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Exam Metadata */}
                            <div className="grid gap-4 md:grid-cols-2 border-t pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="exam-title">Exam Title</Label>
                                    <Input
                                        id="exam-title"
                                        placeholder="e.g., Mid-Term Exam"
                                        value={examTitle}
                                        onChange={(e) => setExamTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo-url">Logo URL (Optional)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="logo-url"
                                            placeholder="e.g., https://example.com/logo.png"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('logo-file-input-ai')?.click()}
                                            className="whitespace-nowrap"
                                        >
                                            Browse
                                        </Button>
                                        <input
                                            id="logo-file-input-ai"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total-marks">Total Marks</Label>
                                    <Input
                                        id="total-marks"
                                        placeholder="e.g., 100"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        placeholder="e.g., 2 Hours"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Question Count Inputs */}
                            <div className="grid gap-4 md:grid-cols-3 border-t pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="num-mcqs">Number of MCQs</Label>
                                    <Input
                                        id="num-mcqs"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={numMcqs}
                                        onChange={(e) => setNumMcqs(parseInt(e.target.value) || 0)}
                                        disabled={selectedChapters.length === 0}
                                    />
                                    <p className="text-xs text-muted-foreground">Max 100 MCQs - AI will generate fresh questions</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="num-short-questions">Number of Short Questions</Label>
                                    <Input
                                        id="num-short-questions"
                                        type="number"
                                        min={0}
                                        max={50}
                                        value={numShortQuestions}
                                        onChange={(e) => setNumShortQuestions(parseInt(e.target.value) || 0)}
                                        disabled={selectedChapters.length === 0}
                                    />
                                    <p className="text-xs text-muted-foreground">Max 50 questions - AI will generate fresh questions</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="num-long-questions">Number of Long Questions</Label>
                                    <Input
                                        id="num-long-questions"
                                        type="number"
                                        min={0}
                                        max={20}
                                        value={numLongQuestions}
                                        onChange={(e) => setNumLongQuestions(parseInt(e.target.value) || 0)}
                                        disabled={selectedChapters.length === 0}
                                    />
                                    <p className="text-xs text-muted-foreground">Max 20 questions - AI will generate fresh questions</p>
                                </div>
                            </div>

                            {/* Custom Long Questions */}
                            <div className="space-y-4 border-t pt-6">
                                <Label htmlFor="custom-long-questions">Add Custom Long Questions (one per line)</Label>
                                <Textarea
                                    id="custom-long-questions"
                                    placeholder="e.g., Explain the theory of relativity."
                                    value={customLongQuestions}
                                    onChange={(e) => setCustomLongQuestions(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            {/* Answer Key Toggle */}
                            <div className="flex items-center space-x-2 border-t pt-6">
                                <Switch
                                    id="show-answer-key"
                                    checked={showAnswerKey}
                                    onCheckedChange={setShowAnswerKey}
                                />
                                <Label htmlFor="show-answer-key" className="cursor-pointer">
                                    Include Answer Key in Printout
                                </Label>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end gap-2 bg-muted/50">
                            <Button
                                onClick={handleGenerateWithAI}
                                disabled={selectedChapters.length === 0 || isGeneratingAI}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                size="lg"
                            >
                                {isGeneratingAI ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating with AI...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Questions with AI
                                    </>
                                )}
                            </Button>
                            <Button onClick={handlePrint} disabled={!generatedExam} variant="outline">
                                <Printer className="mr-2 h-4 w-4" />
                                Print Exam
                            </Button>
                            <Button onClick={handleDownloadPDF} disabled={!generatedExam} variant="outline">
                                <FileDown className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </CardFooter>
                    </Card>

                    {generatedExam && (
                        <div id="printable-exam" className="bg-white border border-gray-300 print:border-0 max-w-4xl mx-auto">
                            {/* Exam Header - Minimal Document Style */}
                            <div className="border-b-2 border-black p-3 print:p-2 relative">
                                {logoUrl && (
                                    <div className="absolute left-2 top-2 h-16 w-16 print:h-14 print:w-14">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" />
                                    </div>
                                )}
                                <div className="text-center">
                                    <h1 className="text-xl print:text-lg font-bold uppercase tracking-wide mb-1 print:mb-0.5">
                                        {examTitle || "Examination Paper"}
                                    </h1>
                                    <div className="text-sm print:text-xs font-semibold">
                                        {selectedCourse} - {selectedSubject}
                                    </div>
                                    {selectedChapters.length > 0 && (
                                        <p className="text-xs print:text-[10px] mt-0.5">
                                            Chapters: {selectedChapters.join(", ")}
                                        </p>
                                    )}
                                </div>

                                {/* Metadata - Compact */}
                                <div className="mt-2 print:mt-1 pt-2 print:pt-1 border-t border-gray-400 flex justify-between text-xs print:text-[10px]">
                                    <span><strong>Date:</strong> {currentDate}</span>
                                    {totalMarks && <span><strong>Total Marks:</strong> {totalMarks}</span>}
                                    {duration && <span><strong>Time:</strong> {duration}</span>}
                                </div>

                                {/* Student Info - Inline */}
                                <div className="mt-2 print:mt-1 flex gap-4 text-xs print:text-[10px]">
                                    <div className="flex-1">
                                        <strong>Name:</strong> ___________________________
                                    </div>
                                    <div className="flex-1">
                                        <strong>Roll No:</strong> ___________________________
                                    </div>
                                </div>
                            </div>

                            {/* Exam Content - Ultra Compact */}
                            <div className="p-3 print:p-2 text-xs print:text-[10px] space-y-3 print:space-y-2">
                                {/* MCQs Section */}
                                {generatedExam.mcqs.length > 0 && (
                                    <section className="print-avoid-break">
                                        <h3 className="font-bold text-sm print:text-xs border-b border-black pb-0.5 mb-1.5 print:mb-1 uppercase">
                                            Section A: Multiple Choice Questions
                                        </h3>
                                        <div className="space-y-1 print:space-y-0.5">
                                            {generatedExam.mcqs.map((mcq, index) => {
                                                const optionLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
                                                return (
                                                    <div key={`mcq-${index}`} className="print-avoid-break leading-tight">
                                                        <div className="font-semibold">
                                                            {index + 1}. {mcq.questionText}
                                                        </div>
                                                        <div className="ml-4 print:ml-3 grid grid-cols-2 gap-x-2 gap-y-0">
                                                            {mcq.options.map((option, optIndex) => {
                                                                const optionText = typeof option === 'string' ? option : option.label;
                                                                const isCorrect = showAnswerKey && optionText === mcq.correctAnswer;
                                                                return (
                                                                    <div key={optIndex} className={isCorrect ? 'font-bold' : ''}>
                                                                        {optionLetters[optIndex]}) {optionText}
                                                                        {isCorrect && ' ✓'}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Short Questions Section */}
                                {generatedExam.shortQuestions.length > 0 && (
                                    <section className="print-avoid-break">
                                        <h3 className="font-bold text-sm print:text-xs border-b border-black pb-0.5 mb-1.5 print:mb-1 uppercase">
                                            Section B: Short Answer Questions
                                        </h3>
                                        <div className="space-y-1.5 print:space-y-1">
                                            {generatedExam.shortQuestions.map((q, index) => (
                                                <div key={`short-${index}`} className="print-avoid-break leading-tight font-semibold">
                                                    {index + 1}. {q}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Long Questions Section */}
                                {generatedExam.longQuestions.length > 0 && (
                                    <section>
                                        <h3 className="font-bold text-sm print:text-xs border-b border-black pb-0.5 mb-1.5 print:mb-1 uppercase">
                                            Section C: Long Answer Questions
                                        </h3>
                                        <div className="space-y-1.5 print:space-y-1">
                                            {generatedExam.longQuestions.map((q, index) => (
                                                <div key={`long-${index}`} className="print-avoid-break leading-tight font-semibold">
                                                    {index + 1}. {q}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Answer Key Section */}
                            {showAnswerKey && generatedExam.mcqs.length > 0 && (
                                <div className="print-break-before border-t-2 border-black p-3 print:p-2">
                                    <h3 className="text-sm print:text-xs font-bold mb-2 print:mb-1 uppercase border-b border-black pb-0.5">
                                        Answer Key - MCQs
                                    </h3>
                                    <div className="grid grid-cols-5 gap-1 text-xs print:text-[10px]">
                                        {generatedExam.mcqs.map((mcq, index) => (
                                            <div key={`answer-${index}`} className="font-medium">
                                                {index + 1}. {mcq.correctAnswer}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
