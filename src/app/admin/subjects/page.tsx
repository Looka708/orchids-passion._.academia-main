
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
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

// Default fallback course types (same as in MCQs page)
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

const COURSE_LABELS: Record<string, string> = {
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
    const [selectedCourse, setSelectedCourse] = useState<string>("");

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

                // Update labels
                data.data.forEach((cls: any) => {
                    if (!COURSE_LABELS[cls.slug]) {
                        COURSE_LABELS[cls.slug] = cls.name;
                    }
                });
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

    const handleAddSubject = async () => {
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

    const handleUpdateSubject = async () => {
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
            <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-muted/40 p-4 md:p-8">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/admin/mcqs">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Subjects Management</h1>
                                <p className="text-muted-foreground">Manage subjects for each course type.</p>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Select Course</CardTitle>
                            <CardDescription>Choose a course to manage its subjects.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCourseTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {COURSE_LABELS[type] || type.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCourse && (
                                    <Button onClick={() => {
                                        setFormData({ subject_name: "", description: "", icon_name: "BookOpen" });
                                        setIsAddDialogOpen(true);
                                    }} className="ml-auto">
                                        <Plus className="mr-2 h-4 w-4" /> Add Subject
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedCourse && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Subjects for {COURSE_LABELS[selectedCourse] || selectedCourse.toUpperCase()}</CardTitle>
                                        <CardDescription>
                                            {subjects.length} subjects found.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Library className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                        <p>No subjects found for this course.</p>
                                        <p className="text-sm">Click "Add Subject" to create one.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Icon</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subjects.map((subject) => (
                                                <TableRow key={subject.id}>
                                                    <TableCell className="font-medium capitalize">{subject.subject_name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{subject.description || "-"}</TableCell>
                                                    <TableCell className="font-mono text-xs">{subject.icon_name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditDialog(subject)}
                                                            >
                                                                <Pencil className="h-4 w-4 text-blue-500" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete <strong>{subject.subject_name}</strong>?
                                                                            This action cannot be undone.
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
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* ADD DIALOG */}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Subject</DialogTitle>
                                <DialogDescription>
                                    Create a new subject for {COURSE_LABELS[selectedCourse] || selectedCourse}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Subject Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.subject_name}
                                        onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea
                                        id="desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Icon Name (Lucide React)</Label>
                                    <Input
                                        id="icon"
                                        value={formData.icon_name}
                                        onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                        placeholder="e.g. Brain, FlaskConical, etc."
                                    />
                                    <p className="text-xs text-muted-foreground">Internal icon name used for display.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddSubject}>Create Subject</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* EDIT DIALOG */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Subject</DialogTitle>
                                <DialogDescription>
                                    Update details for {editingSubject?.subject_name}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Subject Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={formData.subject_name}
                                        onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-desc">Description</Label>
                                    <Textarea
                                        id="edit-desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-icon">Icon Name</Label>
                                    <Input
                                        id="edit-icon"
                                        value={formData.icon_name}
                                        onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateSubject}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </ProtectedRoute>
    );
}
