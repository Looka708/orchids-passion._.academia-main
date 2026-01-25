
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import {
    Plus,
    Pencil,
    Trash2,
    BookOpen,
    ArrowLeft,
    Loader2,
    Library,
    Wand2,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

// Default fallback course types
const DEFAULT_COURSE_TYPES = [
    "afns",
    "paf",
    "mcj",
    "mcm",
    "class-6",
    "class-7",
    "class-8",
    "class-9",
    "class-10",
    "class-11",
    "class-12",
];

const INITIAL_COURSE_LABELS: Record<string, string> = {
    afns: "AFNS",
    paf: "PAF",
    mcj: "MCJ",
    mcm: "MCM",
    "class-6": "Class 6",
    "class-7": "Class 7",
    "class-8": "Class 8",
    "class-9": "Class 9",
    "class-10": "Class 10",
    "class-11": "Class 11",
    "class-12": "Class 12",
};

const STANDARD_SUBJECTS: Record<string, string[]> = {
    academic: [
        "Biology", "Chemistry", "Physics", "Mathematics", "Computer Science",
        "English", "Urdu", "Islamiat", "Pakistan Studies"
    ],
    military: [
        "Biology", "Chemistry", "Physics", "English", "General Knowledge",
        "Intelligence (Verbal)", "Intelligence (Non-Verbal)"
    ]
};

interface SubjectRecord {
    id: string;
    course_type: string;
    subject_name: string;
    description?: string;
    icon_name?: string;
}

export default function SubjectsManagementPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
    const [availableCourseTypes, setAvailableCourseTypes] = useState<string[]>(DEFAULT_COURSE_TYPES);
    const [courseLabels, setCourseLabels] = useState<Record<string, string>>(INITIAL_COURSE_LABELS);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [isInitializing, setIsInitializing] = useState(false);

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        subject_name: "",
        description: "",
        icon_name: "BookOpen", // Default icon
    });

    useEffect(() => {
        fetchAvailableCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchSubjects();
        } else {
            setSubjects([]);
        }
    }, [selectedCourse]);

    async function fetchAvailableCourses() {
        try {
            const response = await fetch("/api/classes");
            const data = await response.json();
            if (data.success && data.data) {
                const classSlugs = data.data.map((cls: any) => cls.slug);
                const allCourseTypes = Array.from(new Set([...DEFAULT_COURSE_TYPES, ...classSlugs]));
                setAvailableCourseTypes(allCourseTypes);

                // Update labels state
                const newLabels = { ...INITIAL_COURSE_LABELS };
                data.data.forEach((cls: any) => {
                    newLabels[cls.slug] = cls.name;
                });
                setCourseLabels(newLabels);
            }
        } catch (error) {
            console.error("Error fetching available courses:", error);
        }
    }

    async function fetchSubjects() {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/subjects?course_type=${selectedCourse}`);
            const data = await response.json();
            if (data.success) {
                setSubjects(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch subjects.",
            });
        } finally {
            setLoading(false);
        }
    }

    const handleAddSubject = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedCourse) {
            toast({ variant: "destructive", title: "Error", description: "Please select a course first." });
            return;
        }
        if (!formData.subject_name) {
            toast({ variant: "destructive", title: "Error", description: "Subject name is required." });
            return;
        }

        try {
            const response = await fetch("/api/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    course_type: selectedCourse,
                }),
            });
            const data = await response.json();

            if (data.success) {
                toast({ title: "Success", description: "Subject added successfully." });
                setIsAddDialogOpen(false);
                setFormData({ subject_name: "", description: "", icon_name: "BookOpen" }); // Reset
                fetchSubjects();
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add subject" });
        }
    };

    const handleInitializeStandard = async (type: 'academic' | 'military') => {
        if (!selectedCourse) return;
        setIsInitializing(true);
        const subjectsToAdd = STANDARD_SUBJECTS[type];

        try {
            let successCount = 0;
            for (const name of subjectsToAdd) {
                // Check if already exists to avoid duplicates
                if (subjects.some(s => s.subject_name.toLowerCase() === name.toLowerCase())) continue;

                const response = await fetch("/api/subjects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subject_name: name,
                        course_type: selectedCourse,
                        description: `Default ${name} subject for ${courseLabels[selectedCourse]}`,
                        icon_name: "BookOpen",
                    }),
                });
                if (response.ok) successCount++;
            }

            toast({
                title: "Initialization Complete",
                description: `Successfully added ${successCount} standard subjects.`,
            });
            fetchSubjects();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Batch initialization failed." });
        } finally {
            setIsInitializing(false);
        }
    };

    const handleUpdateSubject = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!editingSubject) return;

        try {
            const response = await fetch(`/api/subjects?id=${editingSubject.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.success) {
                toast({ title: "Success", description: "Subject updated successfully." });
                setIsEditDialogOpen(false);
                setEditingSubject(null);
                setFormData({ subject_name: "", description: "", icon_name: "BookOpen" }); // Reset
                fetchSubjects();
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update subject" });
        }
    };

    const handleDeleteSubject = async (id: string) => {
        try {
            const response = await fetch(`/api/subjects?id=${id}`, { method: "DELETE" });
            const data = await response.json();

            if (data.success) {
                toast({ title: "Success", description: "Subject deleted successfully." });
                fetchSubjects();
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete subject" });
        }
    };

    const openEditDialog = (subject: SubjectRecord) => {
        setEditingSubject(subject);
        setFormData({
            subject_name: subject.subject_name,
            description: subject.description || "",
            icon_name: subject.icon_name || "BookOpen",
        });
        setIsEditDialogOpen(true);
    };

    return (
        <ProtectedRoute adminOnly={true}>
            <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8">
                <div className="mx-auto w-full max-w-6xl space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                                <Link href="/admin">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Subject Management
                                </h1>
                                <p className="text-muted-foreground mt-1">Configure subjects for each course and class.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar - Course Selection */}
                        <Card className="lg:col-span-1 border-0 shadow-lg h-fit sticky top-8">
                            <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b">
                                <CardTitle className="text-lg">Select Course</CardTitle>
                                <CardDescription>Choose a class to manage</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <Label>Course Type</Label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pick a class..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCourseTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {courseLabels[type] || type.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedCourse && (
                                        <div className="pt-4 border-t mt-4">
                                            <Button
                                                onClick={() => {
                                                    setFormData({ subject_name: "", description: "", icon_name: "BookOpen" });
                                                    setIsAddDialogOpen(true);
                                                }}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Subject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content - Subjects Table */}
                        <div className="lg:col-span-3 space-y-6">
                            {!selectedCourse ? (
                                <Card className="border-dashed border-2 bg-transparent">
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                        <Library className="h-12 w-12 mb-4 opacity-20" />
                                        <h3 className="text-xl font-semibold text-foreground">No Course Selected</h3>
                                        <p className="max-w-xs mt-2">Please select a course from the sidebar to view and manage its subjects.</p>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="border-0 shadow-lg overflow-hidden">
                                    <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-indigo-500" />
                                                {courseLabels[selectedCourse] || selectedCourse.toUpperCase()} Subjects
                                            </CardTitle>
                                            <CardDescription>
                                                {subjects.length} subjects configured for this course.
                                            </CardDescription>
                                        </div>
                                        {subjects.length === 0 && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleInitializeStandard(selectedCourse.includes('class') ? 'academic' : 'military')}
                                                    disabled={isInitializing}
                                                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                >
                                                    {isInitializing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                                    Quick Setup
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                                <p className="text-muted-foreground animate-pulse text-sm">Loading subject data...</p>
                                            </div>
                                        ) : subjects.length === 0 ? (
                                            <div className="text-center py-16 space-y-6">
                                                <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <Library className="h-10 w-10 text-slate-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold">This course is empty</h3>
                                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                                        You haven't added any subjects to <b>{courseLabels[selectedCourse]}</b> yet.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-center gap-4">
                                                    <Button variant="default" onClick={() => setIsAddDialogOpen(true)}>
                                                        <Plus className="mr-2 h-4 w-4" /> Add One Manually
                                                    </Button>
                                                    <div className="relative">
                                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground dark:bg-slate-950">OR</span></div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleInitializeStandard('academic')}>
                                                            <Wand2 className="mr-2 h-4 w-4" /> Academic Set
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleInitializeStandard('military')}>
                                                            <Wand2 className="mr-2 h-4 w-4" /> Military Set
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-md border border-slate-200 dark:border-slate-800">
                                                <Table>
                                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                                        <TableRow>
                                                            <TableHead>Subject Name</TableHead>
                                                            <TableHead className="hidden md:table-cell">Description</TableHead>
                                                            <TableHead>Icon</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {subjects.map((subject) => (
                                                            <TableRow key={subject.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                                                                    {subject.subject_name}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground text-sm max-w-xs truncate hidden md:table-cell">
                                                                    {subject.description || "-"}
                                                                </TableCell>
                                                                <TableCell className="font-mono text-[10px] text-slate-500">
                                                                    <Badge variant="outline" className="font-mono">{subject.icon_name || "BookOpen"}</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => openEditDialog(subject)}
                                                                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Permanently delete <b>{subject.subject_name}</b>? This will also disconnect any MCQs related to this subject (but not delete them).
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleDeleteSubject(subject.id)}
                                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                    >
                                                                                        Delete
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* ADD/EDIT DIALOG */}
                    <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
                        if (!open) {
                            setIsAddDialogOpen(false);
                            setIsEditDialogOpen(false);
                            setEditingSubject(null);
                        }
                    }}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${isEditDialogOpen ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {isEditDialogOpen ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                    </div>
                                    {isEditDialogOpen ? "Edit Subject" : "Add New Subject"}
                                </DialogTitle>
                                <DialogDescription>
                                    Set up the subject details for <b>{courseLabels[selectedCourse]}</b>.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={isEditDialogOpen ? handleUpdateSubject : handleAddSubject} className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Subject Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.subject_name}
                                        onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                                        placeholder="e.g. Mathematics"
                                        className="h-11 shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc" className="text-sm font-semibold">Description (Optional)</Label>
                                    <Textarea
                                        id="desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Briefly describe what this subject covers..."
                                        rows={3}
                                        className="shadow-sm resize-none"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="icon" className="text-sm font-semibold">Icon Identifier</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="icon"
                                            value={formData.icon_name}
                                            onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                            placeholder="BookOpen"
                                            className="h-11 shadow-sm font-mono text-xs"
                                        />
                                        <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border shadow-sm">
                                            <BookOpen className="h-5 w-5 text-indigo-500" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Internal name for library mapping (e.g., FlaskConical, Brain, Atom)</p>
                                </div>
                                <DialogFooter className="pt-4 border-t gap-2">
                                    <Button type="button" variant="ghost" onClick={() => {
                                        setIsAddDialogOpen(false);
                                        setIsEditDialogOpen(false);
                                    }}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8">
                                        {isEditDialogOpen ? "Save Changes" : "Create Subject"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </ProtectedRoute>
    );
}
