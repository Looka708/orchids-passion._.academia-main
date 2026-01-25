"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Database,
  ChevronRight,
  ChevronDown,
  BookOpen,
  GraduationCap,
  FileText,
  ArrowLeft,
  Settings,
  FolderOpen,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface MCQRecord {
  id: string;
  course_type: string;
  subject: string;
  chapter: string;
  question_number: number;
  question_text: string | null;
  question_image: string | null;
  options: string[];
  correct_answer: string;
  language: string;
  created_at: string;
  updated_at: string;
}

interface ChapterData {
  name: string;
  count: number;
}

interface SubjectData {
  name: string;
  count: number;
  chapters: ChapterData[];
}

interface CourseStructure {
  course_type: string;
  subjects: SubjectData[];
}

// Default fallback course types
const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text || "");

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

const SUBJECTS = [
  "biology",
  "chemistry",
  "physics",
  "mathematics",
  "english",
  "urdu",
  "computer",
  "general-science",
  "general-knowledge",
  "verbal-test",
  "non-verbal-test",
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

const COURSE_ICONS: Record<string, string> = {
  afns: "🎖️",
  paf: "✈️",
  mcj: "⚖️",
  mcm: "🏥",
  "class-6": "6️⃣",
  "class-7": "7️⃣",
  "class-8": "8️⃣",
  "class-9": "9️⃣",
  "class-10": "🔟",
  "class-11": "1️⃣1️⃣",
  "class-12": "1️⃣2️⃣",
};

function MCQAdminContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const [structure, setStructure] = useState<CourseStructure[]>([]);
  const [mcqs, setMcqs] = useState<MCQRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [availableCourseTypes, setAvailableCourseTypes] = useState<string[]>([]);
  const [selectedMcqs, setSelectedMcqs] = useState<Set<string>>(new Set());

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination for MCQs
  const [visibleMcqsCount, setVisibleMcqsCount] = useState(5);
  const [mcqPageSize, setMcqPageSize] = useState(5);

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQRecord | null>(null);

  const [renameType, setRenameType] = useState<"subject" | "chapter">("subject");
  const [renameOldName, setRenameOldName] = useState("");
  const [renameNewName, setRenameNewName] = useState("");
  const [renameCourse, setRenameCourse] = useState("");
  const [renameSubject, setRenameSubject] = useState("");

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkUploadCourse, setBulkUploadCourse] = useState("");
  const [bulkUploadSubject, setBulkUploadSubject] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState<{
    success: boolean;
    message: string;
    inserted?: number;
    skipped?: number;
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);

  const [formData, setFormData] = useState({
    course_type: "",
    subject: "",
    chapter: "",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    language: "english",
  });

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  async function fetchAvailableClasses() {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      if (data.success && data.data) {
        const classSlugs = data.data.map((cls: any) => cls.slug);
        setAvailableCourseTypes(classSlugs);

        // Update labels and icons
        data.data.forEach((cls: any) => {
          if (!COURSE_LABELS[cls.slug]) {
            COURSE_LABELS[cls.slug] = cls.name;
          }
          if (!COURSE_ICONS[cls.slug]) {
            const iconMap: Record<string, string> = {
              'GraduationCap': '🎓',
              'Plane': '✈️',
              'FlaskConical': '🧪',
              'ShieldCheck': '🛡️',
            };
            COURSE_ICONS[cls.slug] = iconMap[cls.icon] || '📚';
          }
        });
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }

  useEffect(() => {
    fetchStructure();
    fetchAvailableCourses();
    if (action === "add") {
      setIsAddDialogOpen(true);
    }
  }, [action]);

  async function fetchAvailableCourses() {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      if (data.success && data.data) {
        // Get slugs from classes table
        const classSlugs = data.data.map((cls: any) => cls.slug);
        // Combine with default course types and remove duplicates
        setAvailableCourseTypes(classSlugs);

        // Update COURSE_LABELS and COURSE_ICONS dynamically
        data.data.forEach((cls: any) => {
          if (!COURSE_LABELS[cls.slug]) {
            COURSE_LABELS[cls.slug] = cls.name;
          }
          // Map icon names to emojis if not already set
          if (!COURSE_ICONS[cls.slug]) {
            const iconMap: Record<string, string> = {
              'GraduationCap': '🎓',
              'Plane': '✈️',
              'FlaskConical': '🧪',
              'ShieldCheck': '🛡️',
            };
            COURSE_ICONS[cls.slug] = iconMap[cls.icon] || '📚';
          }
        });
      }
    } catch (error) {
      console.error("Error fetching available courses:", error);
      // Fallback to default course types
      setAvailableCourseTypes(DEFAULT_COURSE_TYPES);
    }
  }

  useEffect(() => {
    if (selectedCourse && selectedSubject) {
      setVisibleMcqsCount(mcqPageSize); // Reset visible count on filter/search
      fetchMcqs();
      setSelectedMcqs(new Set()); // Reset selection
    }
  }, [selectedCourse, selectedSubject, selectedChapter, searchQuery]);

  async function fetchStructure() {
    try {
      const response = await fetch("/api/mcqs/structure");
      const data = await response.json();
      if (data.success) {
        setStructure(data.structure);
        const total = data.structure.reduce(
          (acc: number, course: CourseStructure) =>
            acc +
            course.subjects.reduce(
              (sAcc: number, s: SubjectData) => sAcc + s.count,
              0
            ),
          0
        );
        setTotalCount(total);
      }
    } catch (error) {
      console.error("Error fetching structure:", error);
    }
  }

  async function fetchMcqs() {
    if (!selectedCourse || !selectedSubject) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        course_type: selectedCourse,
        subject: selectedSubject,
      });
      if (selectedChapter) params.append("chapter", selectedChapter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/mcqs?${params}`);
      const data = await response.json();
      if (data.success) {
        // Deduplicate MCQs by question text and options to clean up existing "old" duplicates
        const uniqueMcqs = data.mcqs.filter((mcq: any, index: number, self: any[]) =>
          index === self.findIndex((m) => (
            m.question_text === mcq.question_text &&
            JSON.stringify(m.options) === JSON.stringify(mcq.options)
          ))
        );
        setMcqs(uniqueMcqs);
      }
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch MCQs",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMcq() {
    try {
      const options = Array.from(new Set([
        formData.option_a,
        formData.option_b,
        formData.option_c,
        formData.option_d,
      ].filter(Boolean)));

      const response = await fetch("/api/mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_type: formData.course_type,
          subject: formData.subject,
          chapter: formData.chapter,
          question_text: formData.question_text,
          options,
          correct_answer: formData.correct_answer,
          language: formData.language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "MCQ added successfully" });
        setIsAddDialogOpen(false);
        resetForm();
        fetchMcqs();
        fetchStructure();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add MCQ",
      });
    }
  }

  async function handleUpdateMcq() {
    if (!editingMcq) return;

    try {
      const options = Array.from(new Set([
        formData.option_a,
        formData.option_b,
        formData.option_c,
        formData.option_d,
      ].filter(Boolean)));

      const response = await fetch(`/api/mcqs/${editingMcq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: formData.question_text,
          options,
          correct_answer: formData.correct_answer,
          chapter: formData.chapter,
          language: formData.language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "MCQ updated successfully" });
        setIsEditDialogOpen(false);
        setEditingMcq(null);
        resetForm();
        fetchMcqs();
        fetchStructure();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update MCQ",
      });
    }
  }

  async function handleDeleteMcq(id: string) {
    try {
      const response = await fetch(`/api/mcqs/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "MCQ deleted successfully" });
        fetchMcqs();
        fetchStructure();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete MCQ",
      });
    }
  }

  async function handleRename() {
    try {
      const response = await fetch("/api/mcqs/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: renameType,
          course_type: renameCourse,
          subject: renameSubject,
          old_name: renameOldName,
          new_name: renameNewName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        setIsRenameDialogOpen(false);
        setRenameOldName("");
        setRenameNewName("");
        fetchStructure();
        if (selectedCourse && selectedSubject) {
          fetchMcqs();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename",
      });
    }
  }

  async function handleBulkDelete() {
    if (selectedMcqs.size === 0) return;

    // Optimistic update
    const previousMcqs = [...mcqs];
    const newMcqs = mcqs.filter(m => !selectedMcqs.has(m.id));
    setMcqs(newMcqs);

    try {
      const response = await fetch("/api/mcqs/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedMcqs) })
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: `Deleted ${data.count} MCQs successfully` });
        setSelectedMcqs(new Set());
        fetchStructure();
      } else {
        // Revert on failure
        setMcqs(previousMcqs);
        throw new Error(data.error);
      }
    } catch (error) {
      setMcqs(previousMcqs);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected MCQs"
      });
    }
  }

  function toggleMcqSelection(id: string) {
    setSelectedMcqs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function toggleAllSelection(checked: boolean) {
    if (checked) {
      // Select all currently visible/loaded MCQs
      const allIds = mcqs.map(m => m.id);
      setSelectedMcqs(new Set(allIds));
    } else {
      setSelectedMcqs(new Set());
    }
  }

  function openEditDialog(mcq: MCQRecord) {
    setEditingMcq(mcq);
    setFormData({
      course_type: mcq.course_type,
      subject: mcq.subject,
      chapter: mcq.chapter,
      question_text: mcq.question_text || "",
      option_a: mcq.options[0] || "",
      option_b: mcq.options[1] || "",
      option_c: mcq.options[2] || "",
      option_d: mcq.options[3] || "",
      correct_answer: mcq.correct_answer,
      language: mcq.language,
    });
    setIsEditDialogOpen(true);
  }

  function openRenameDialog(
    type: "subject" | "chapter",
    course: string,
    subject: string,
    name: string
  ) {
    setRenameType(type);
    setRenameCourse(course);
    setRenameSubject(subject);
    setRenameOldName(name);
    setRenameNewName(name);
    setIsRenameDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      course_type: selectedCourse || "",
      subject: selectedSubject || "",
      chapter: selectedChapter || "",
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      language: "english",
    });
  }

  function openAddDialog() {
    resetForm();
    setIsAddDialogOpen(true);
  }

  function openBulkUploadDialog() {
    setBulkUploadFile(null);
    setBulkUploadCourse("");
    setBulkUploadSubject("");
    setBulkUploadResult(null);
    setIsBulkUploadOpen(true);
  }

  async function handleBulkUpload() {
    if (!bulkUploadFile || !bulkUploadCourse || !bulkUploadSubject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select file, course, and subject",
      });
      return;
    }

    setBulkUploading(true);
    setBulkUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", bulkUploadFile);
      formData.append("course_type", bulkUploadCourse);
      formData.append("subject", bulkUploadSubject);

      const response = await fetch("/api/mcqs/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setBulkUploadResult({
          success: true,
          message: data.message,
          inserted: data.inserted,
          skipped: data.skipped,
          errors: data.validation_errors,
        });
        fetchStructure();
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        setBulkUploadResult({
          success: false,
          message: data.error || "Upload failed",
          errors: data.errors,
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Upload failed",
        });
      }
    } catch (error) {
      setBulkUploadResult({
        success: false,
        message: "Failed to upload file",
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file",
      });
    } finally {
      setBulkUploading(false);
    }
  }

  function downloadTemplate() {
    const headers = ["Chapter", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Language"];
    const sampleRow = ["Chapter 1", "What is the capital of Pakistan?", "Lahore", "Karachi", "Islamabad", "Peshawar", "C", "english"];

    const csvContent = [
      headers.join(","),
      sampleRow.join(","),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportToCsv(data: MCQRecord[], filename: string) {
    const headers = ["Chapter", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Language"];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = data.map(mcq => [
      escapeCsv(mcq.chapter),
      escapeCsv(mcq.question_text),
      escapeCsv(mcq.options[0]),
      escapeCsv(mcq.options[1]),
      escapeCsv(mcq.options[2]),
      escapeCsv(mcq.options[3]),
      escapeCsv(mcq.correct_answer),
      escapeCsv(mcq.language)
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportMcqs() {
    // If we have selected items, export those immediately (client-side)
    if (selectedMcqs.size > 0) {
      const dataToExport = mcqs.filter((mcq) => selectedMcqs.has(mcq.id));
      exportToCsv(dataToExport, `mcqs_selected_${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Success",
        description: `Exported ${selectedMcqs.size} selected MCQs`,
      });
      return;
    }

    // Otherwise, use the API for potentially large exports
    const params = new URLSearchParams();
    if (selectedCourse) params.append("course_type", selectedCourse);
    if (selectedSubject) params.append("subject", selectedSubject);
    if (selectedChapter) params.append("chapter", selectedChapter);

    toast({
      title: "Preparing export",
      description: "Fetching MCQs from server...",
    });

    try {
      const response = await fetch(`/api/mcqs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = `mcqs_export_${selectedSubject || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Export completed" });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to export MCQs",
      });
    }
  }

  function toggleCourse(courseType: string) {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseType)) {
        newSet.delete(courseType);
      } else {
        newSet.add(courseType);
      }
      return newSet;
    });
  }

  function toggleSubject(key: string) {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }

  function selectChapter(course: string, subject: string, chapter: string | null) {
    setSelectedCourse(course);
    setSelectedSubject(subject);
    setSelectedChapter(chapter);
  }

  function goBack() {
    if (selectedChapter) {
      setSelectedChapter(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
      setMcqs([]);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    }
  }

  const currentCourseData = structure.find((c) => c.course_type === selectedCourse);
  const currentSubjectData = currentCourseData?.subjects.find(
    (s) => s.name === selectedSubject
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(selectedCourse || selectedSubject || selectedChapter) && (
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MCQ Management
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Link href="/admin" className="hover:text-primary">
                  Admin
                </Link>
                {selectedCourse && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span
                      className="hover:text-primary cursor-pointer"
                      onClick={() => {
                        setSelectedSubject(null);
                        setSelectedChapter(null);
                        setMcqs([]);
                      }}
                    >
                      {(selectedCourse && COURSE_LABELS[selectedCourse]) || selectedCourse}
                    </span>
                  </>
                )}
                {selectedSubject && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span
                      className="hover:text-primary cursor-pointer capitalize"
                      onClick={() => setSelectedChapter(null)}
                    >
                      {selectedSubject.replace("-", " ")}
                    </span>
                  </>
                )}
                {selectedChapter && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span className="capitalize">{selectedChapter}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900"
            >
              <Database className="mr-2 h-4 w-4" />
              {totalCount.toLocaleString()} MCQs
            </Badge>
            <Button asChild variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/40">
              <Link href="/admin/subjects">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Subjects
              </Link>
            </Button>
            <Button onClick={openBulkUploadDialog} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              onClick={handleExportMcqs}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40"
            >
              <Download className="mr-2 h-4 w-4" />
              Export MCQs
            </Button>
            <Button onClick={openAddDialog} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Add MCQ
            </Button>
          </div>
        </div>

        {!selectedSubject ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {structure.map((course) => (
              <Card
                key={course.course_type}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800"
              >
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {COURSE_ICONS[course.course_type] || "📚"}
                      </span>
                      <div>
                        <CardTitle className="text-lg">
                          {COURSE_LABELS[course.course_type] || course.course_type}
                        </CardTitle>
                        <CardDescription className="text-indigo-100">
                          {course.subjects.reduce((acc, s) => acc + s.count, 0)} MCQs
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {course.subjects.length} Subjects
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[280px]">
                    {course.subjects.map((subject) => (
                      <Collapsible
                        key={`${course.course_type}-${subject.name}`}
                        open={expandedSubjects.has(`${course.course_type}-${subject.name}`)}
                        onOpenChange={() =>
                          toggleSubject(`${course.course_type}-${subject.name}`)
                        }
                      >
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors">
                          <CollapsibleTrigger className="flex items-center gap-3 flex-1 cursor-pointer text-left">
                            {expandedSubjects.has(
                              `${course.course_type}-${subject.name}`
                            ) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <BookOpen className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium capitalize">
                              {subject.name.replace("-", " ")}
                            </span>
                          </CollapsibleTrigger>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {subject.count} MCQs
                            </Badge>
                            <div
                              role="button"
                              tabIndex={0}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameDialog(
                                  "subject",
                                  course.course_type,
                                  subject.name,
                                  subject.name
                                );
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                        <CollapsibleContent>
                          <div className="bg-slate-50/50 dark:bg-slate-800/50">
                            <div
                              className="flex items-center justify-between px-4 py-2 pl-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-slate-100 dark:border-slate-700"
                              onClick={() =>
                                selectChapter(course.course_type, subject.name, null)
                              }
                            >
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                  View All MCQs
                                </span>
                              </div>
                              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                {subject.count}
                              </Badge>
                            </div>
                            {subject.chapters.map((chapter) => (
                              <div
                                key={chapter.name}
                                className="flex items-center justify-between px-4 py-2 pl-10 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                                onClick={() =>
                                  selectChapter(
                                    course.course_type,
                                    subject.name,
                                    chapter.name
                                  )
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm">{chapter.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {chapter.count}
                                  </Badge>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openRenameDialog(
                                        "chapter",
                                        course.course_type,
                                        subject.name,
                                        chapter.name
                                      );
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <FileText className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {(selectedCourse && COURSE_ICONS[selectedCourse]) || "📚"}
                        </span>
                        {(selectedCourse && COURSE_LABELS[selectedCourse]) || selectedCourse} -{" "}
                        <span className="capitalize">
                          {selectedSubject.replace("-", " ")}
                        </span>
                        {selectedChapter && (
                          <span className="text-muted-foreground font-normal">
                            / {selectedChapter}
                          </span>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="ml-10">
                      {mcqs.length} MCQs found
                      {currentSubjectData && ` • ${currentSubjectData.chapters.length} chapters available`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    {selectedMcqs.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground mr-2">
                          {selectedMcqs.size} selected
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Selected
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {selectedMcqs.size} MCQs. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    <Select
                      value={selectedChapter || "all"}
                      onValueChange={(v) =>
                        setSelectedChapter(v === "all" ? null : v)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All chapters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Chapters</SelectItem>
                        {currentSubjectData?.chapters.map((ch) => (
                          <SelectItem key={ch.name} value={ch.name}>
                            {ch.name} ({ch.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchMcqs}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : mcqs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MCQs found. Add some to get started!</p>
                    <Button onClick={openAddDialog} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First MCQ
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                          <TableHead className="w-10 text-center">
                            <Checkbox
                              checked={mcqs.length > 0 && selectedMcqs.size === mcqs.length}
                              onCheckedChange={(c) => toggleAllSelection(!!c)}
                            />
                          </TableHead>
                          <TableHead className="w-12 font-semibold">#</TableHead>
                          <TableHead className="min-w-[350px] font-semibold">
                            Question
                          </TableHead>
                          <TableHead className="font-semibold">Chapter</TableHead>
                          <TableHead className="font-semibold">Answer</TableHead>
                          <TableHead className="text-right font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mcqs.slice(0, visibleMcqsCount).map((mcq, index) => (
                          <TableRow
                            key={mcq.id}
                            className={cn(
                              "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                              selectedMcqs.has(mcq.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : '',
                              mcq.language === 'urdu' ? 'rtl-text' : ''
                            )}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={selectedMcqs.has(mcq.id)}
                                onCheckedChange={() => toggleMcqSelection(mcq.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md">
                                <p className={cn("line-clamp-2 font-medium", mcq.language === 'urdu' ? 'font-urdu text-xl' : '')}>
                                  {mcq.question_text || "(Image-based question)"}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {Array.from(new Set(mcq.options)).slice(0, 4).map((opt, i) => (
                                    <Badge
                                      key={i}
                                      variant={
                                        opt === mcq.correct_answer
                                          ? "default"
                                          : "outline"
                                      }
                                      className={`text-xs ${opt === mcq.correct_answer
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300"
                                        : ""
                                        }`}
                                    >
                                      {String.fromCharCode(65 + i)}){" "}
                                      <span className={cn(mcq.language === 'urdu' ? 'font-urdu' : '')}>
                                        {typeof opt === "string"
                                          ? opt.substring(0, 25)
                                          : "..."}
                                        {typeof opt === "string" &&
                                          opt.length > 25 &&
                                          "..."}
                                      </span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              >
                                {mcq.chapter}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={cn("text-sm text-green-600 dark:text-green-400 font-medium line-clamp-1", mcq.language === 'urdu' ? 'font-urdu text-lg' : '')}>
                                {mcq.correct_answer.substring(0, 35)}
                                {mcq.correct_answer.length > 35 && "..."}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(mcq)}
                                  className="hover:bg-blue-100 hover:text-blue-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-red-100 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete MCQ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This MCQ will be
                                        permanently deleted.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteMcq(mcq.id)}
                                        className="bg-red-600 hover:bg-red-700"
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
                    <div className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row border-t mt-4 px-2 bg-slate-50/50 dark:bg-slate-900/10 rounded-b-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Show</p>
                          <Select
                            value={mcqPageSize.toString()}
                            onValueChange={(v) => {
                              const newSize = parseInt(v);
                              setMcqPageSize(newSize);
                              setVisibleMcqsCount(newSize);
                            }}
                          >
                            <SelectTrigger className="h-9 w-[80px] bg-background border-slate-200 dark:border-slate-800 shadow-sm">
                              <SelectValue placeholder={mcqPageSize.toString()} />
                            </SelectTrigger>
                            <SelectContent side="top">
                              {[5, 10, 20, 50, 100].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                  {size} items
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">per view</p>
                      </div>
                      {visibleMcqsCount < mcqs.length && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVisibleMcqsCount((prev) => prev + mcqPageSize)}
                          className="font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-slate-200 dark:border-slate-800"
                        >
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          Show {Math.min(mcqPageSize, mcqs.length - visibleMcqsCount)} More
                        </Button>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${(Math.min(visibleMcqsCount, mcqs.length) / mcqs.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          <span className="text-foreground">{Math.min(visibleMcqsCount, mcqs.length)}</span>
                          <span className="mx-1">/</span>
                          <span>{mcqs.length}</span>
                        </p>
                      </div>
                    </div>
                  </ScrollArea>

                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Add New MCQ
              </DialogTitle>
              <DialogDescription>Create a new multiple choice question</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Course Type</Label>
                  <Select
                    value={formData.course_type}
                    onValueChange={(v) => setFormData({ ...formData, course_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourseTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {COURSE_ICONS[type]} {COURSE_LABELS[type] || type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(v) => setFormData({ ...formData, subject: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chapter</Label>
                  <Input
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="e.g. Chapter 1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                  placeholder="Enter the question..."
                  rows={3}
                  className={cn(isUrdu(formData.question_text) ? 'font-urdu text-xl rtl-text' : '')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Option A</Label>
                  <Input
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    className={cn(isUrdu(formData.option_a) ? 'font-urdu text-xl rtl-text' : '')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option B</Label>
                  <Input
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    className={cn(isUrdu(formData.option_b) ? 'font-urdu text-xl rtl-text' : '')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option C</Label>
                  <Input
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                    className={cn(isUrdu(formData.option_c) ? 'font-urdu text-xl rtl-text' : '')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option D</Label>
                  <Input
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                    className={cn(isUrdu(formData.option_d) ? 'font-urdu text-xl rtl-text' : '')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Select
                  value={formData.correct_answer}
                  onValueChange={(v) => setFormData({ ...formData, correct_answer: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set([formData.option_a, formData.option_b, formData.option_c, formData.option_d].filter(Boolean))).map((opt, i) => (
                      <SelectItem key={i} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMcq}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Add MCQ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-500" />
                Edit MCQ
              </DialogTitle>
              <DialogDescription>Update the question details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Chapter</Label>
                <Input
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="Chapter name"
                />
              </div>
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                  placeholder="Enter the question..."
                  rows={3}
                  className={cn(isUrdu(formData.question_text) ? 'font-urdu text-xl rtl-text' : '')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Option A</Label>
                  <Input
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option B</Label>
                  <Input
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option C</Label>
                  <Input
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option D</Label>
                  <Input
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Select
                  value={formData.correct_answer}
                  onValueChange={(v) => setFormData({ ...formData, correct_answer: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set([formData.option_a, formData.option_b, formData.option_c, formData.option_d].filter(Boolean))).map((opt, i) => (
                      <SelectItem key={i} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMcq}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                Update MCQ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                Rename {renameType === "subject" ? "Subject" : "Chapter"}
              </DialogTitle>
              <DialogDescription>
                This will update all MCQs in{" "}
                {renameType === "subject"
                  ? `${(renameCourse && COURSE_LABELS[renameCourse]) || renameCourse}`
                  : `${(renameCourse && COURSE_LABELS[renameCourse]) || renameCourse} > ${renameSubject}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Current Name</Label>
                <Input value={renameOldName} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>New Name</Label>
                <Input
                  value={renameNewName}
                  onChange={(e) => setRenameNewName(e.target.value)}
                  placeholder={`Enter new ${renameType} name`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRename}
                disabled={!renameNewName || renameNewName === renameOldName}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-amber-500" />
                Bulk Upload MCQs from Excel
              </DialogTitle>
              <DialogDescription>
                Upload an Excel file (.xlsx, .xls) or CSV file with MCQ data
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Download Template</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Get the correct format for your MCQs</p>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate} className="border-blue-300">
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Type *</Label>
                  <Select value={bulkUploadCourse} onValueChange={setBulkUploadCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourseTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {COURSE_ICONS[type]} {COURSE_LABELS[type] || type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={bulkUploadSubject} onValueChange={setBulkUploadSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload File *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${bulkUploadFile
                    ? "border-green-400 bg-green-50 dark:bg-green-950"
                    : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    }`}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="bulk-upload-file"
                  />
                  <label htmlFor="bulk-upload-file" className="cursor-pointer">
                    {bulkUploadFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium text-green-700 dark:text-green-300">{bulkUploadFile.name}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {(bulkUploadFile.size / 1024).toFixed(1)} KB • Click to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Excel (.xlsx, .xls) or CSV files
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border">
                <p className="font-medium text-sm mb-2">Required Columns:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>• Chapter</span>
                  <span>• Question</span>
                  <span>• Option A, B, C, D</span>
                  <span>• Correct Answer (A/B/C/D)</span>
                  <span>• Language (optional)</span>
                </div>
              </div>

              {bulkUploadResult && (
                <div
                  className={`p-4 rounded-lg border ${bulkUploadResult.success
                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                    : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {bulkUploadResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${bulkUploadResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                        {bulkUploadResult.message}
                      </p>
                      {bulkUploadResult.inserted !== undefined && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {bulkUploadResult.inserted} MCQs inserted
                          {bulkUploadResult.skipped ? `, ${bulkUploadResult.skipped} skipped` : ""}
                        </p>
                      )}
                      {bulkUploadResult.errors && bulkUploadResult.errors.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">Errors:</p>
                          {bulkUploadResult.errors.map((err, i) => (
                            <p key={i} className="text-xs text-red-600 dark:text-red-400">
                              Row {err.row}: {err.error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpload}
                disabled={bulkUploading || !bulkUploadFile || !bulkUploadCourse || !bulkUploadSubject}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {bulkUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload MCQs
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function MCQAdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <MCQAdminContent />
      </Suspense>
    </ProtectedRoute>
  );
}
