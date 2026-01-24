
"use client";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";

import { Trash2, Database, BookOpen, RefreshCw, ExternalLink, Users, UserPlus, FileText, Plus, GraduationCap, Plane, FlaskConical, ShieldCheck, Settings, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { addUserToSheet, fetchUsers, toggleUserStatus, deleteUserFromSheet } from "@/app/actions";
import type { User } from "@/lib/users";
import type { ClassRecord, ClassCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";


const courseCategories = ["AFNS", "Classes", "PAF", "MCJ", "MCM"];

interface MCQStats {
    course_type: string;
    subjects: { name: string; count: number }[];
    total: number;
}

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

export default function AdminPage() {
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [mcqStats, setMcqStats] = useState<MCQStats[]>([]);
    const [mcqLoading, setMcqLoading] = useState(false);
    const [totalMcqs, setTotalMcqs] = useState(0);

    // Pagination for users
    const [visibleUsersCount, setVisibleUsersCount] = useState(5);
    const [usersPageSize, setUsersPageSize] = useState(5);

    // State for new user form
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserCourse, setNewUserCourse] = useState('');
    const [newUserRole, setNewUserRole] = useState<'owner' | 'admin' | 'teacher' | 'user'>('user');


    const [classes, setClasses] = useState<ClassRecord[]>([]);
    const [classesLoading, setClassesLoading] = useState(false);

    // New Class Form State
    const [newClassName, setNewClassName] = useState('');
    const [newClassSlug, setNewClassSlug] = useState('');
    const [newClassDesc, setNewClassDesc] = useState('');
    const [newClassCategory, setNewClassCategory] = useState<ClassCategory>('academic');
    const [newClassIcon, setNewClassIcon] = useState('GraduationCap');

    const loadUsers = async () => {
        if (currentUser?.email && currentUser?.role) {
            const fetchedUsers = await fetchUsers(currentUser.email, currentUser.role as 'owner' | 'admin' | 'teacher' | 'user');
            setUsers(fetchedUsers);
        }
    };

    const loadClasses = async () => {
        setClassesLoading(true);
        try {
            const response = await fetch("/api/classes");
            const data = await response.json();
            if (data.success) {
                setClasses(data.data);

                // Dynamically update labels and icons for new classes
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
        } finally {
            setClassesLoading(false);
        }
    };

    const loadMcqStats = async () => {
        setMcqLoading(true);
        try {
            const response = await fetch("/api/mcqs/structure");
            const data = await response.json();
            if (data.success) {
                const stats: MCQStats[] = data.structure.map((course: any) => ({
                    course_type: course.course_type,
                    subjects: course.subjects.map((s: any) => ({ name: s.name, count: s.count })),
                    total: course.subjects.reduce((acc: number, s: any) => acc + s.count, 0),
                }));

                // Combine with existing classes to show those with 0 MCQs
                const finalStats: MCQStats[] = [...stats];

                // Add classes that aren't in stats yet
                classes.forEach(cls => {
                    if (!finalStats.find(s => s.course_type === cls.slug)) {
                        finalStats.push({
                            course_type: cls.slug,
                            subjects: [],
                            total: 0
                        });
                    }
                });

                setMcqStats(finalStats);
                setTotalMcqs(stats.reduce((acc, c) => acc + c.total, 0));
            }
        } catch (error) {
            console.error("Error fetching MCQ stats:", error);
        } finally {
            setMcqLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        loadClasses();
        loadMcqStats();
    }, [currentUser]);

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newClassName,
                    slug: newClassSlug,
                    description: newClassDesc,
                    category: newClassCategory,
                    icon: newClassIcon,
                    display_order: classes.length + 1
                })
            });

            const data = await response.json();
            if (data.success) {
                toast({ title: "Class Created", description: `Successfully created ${newClassName}.` });
                setClasses(prev => [...prev, data.data].sort((a, b) => a.display_order - b.display_order));
                setNewClassName('');
                setNewClassSlug('');
                setNewClassDesc('');
            } else {
                toast({ variant: "destructive", title: "Error", description: data.error });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to create class" });
        }
    };

    const handleDeleteClass = async (id: string, name: string) => {
        try {
            const response = await fetch(`/api/classes?id=${id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                toast({ title: "Class Deleted", description: `Successfully deleted ${name}.` });
                setClasses(prev => prev.filter(c => c.id !== id));
            } else {
                toast({ variant: "destructive", title: "Error", description: data.error });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete class" });
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if teacher has reached limit
        if (currentUser?.role === 'teacher') {
            const teacherStudents = users.filter(u => u.createdBy === currentUser.email);
            if (teacherStudents.length >= 100) {
                toast({
                    variant: "destructive",
                    title: "Student Limit Reached",
                    description: "Teachers can create a maximum of 100 student accounts.",
                });
                return;
            }

            // Teachers can only create students
            if (newUserRole !== 'user') {
                toast({
                    variant: "destructive",
                    title: "Permission Denied",
                    description: "Teachers can only create student accounts.",
                });
                return;
            }
        }

        // Owner can create unlimited of everything (students, teachers, admins, owners)
        // Admin can create unlimited students and max 5 teachers only (NO admins, NO owners)
        if (currentUser?.role === 'owner') {
            // Prevent creating additional owner accounts
            if (newUserRole === 'owner') {
                toast({
                    variant: "destructive",
                    title: "Owner Account Limit",
                    description: "Only one owner account is allowed. Cannot create additional owner accounts.",
                });
                return;
            }
        }

        if (currentUser?.role === 'admin') {
            // Admins cannot create owner accounts
            if (newUserRole === 'owner') {
                toast({
                    variant: "destructive",
                    title: "Permission Denied",
                    description: "Admins cannot create owner accounts.",
                });
                return;
            }

            // Admins cannot create other admin accounts
            if (newUserRole === 'admin') {
                toast({
                    variant: "destructive",
                    title: "Permission Denied",
                    description: "Admins cannot create other admin accounts.",
                });
                return;
            }

            // Limit teacher accounts to 5 for admins
            if (newUserRole === 'teacher') {
                const teacherCount = users.filter(u => u.role === 'teacher').length;
                if (teacherCount >= 5) {
                    toast({
                        variant: "destructive",
                        title: "Teacher Limit Reached",
                        description: "Maximum of 5 teacher accounts allowed. Cannot create more teachers.",
                    });
                    return;
                }
            }
        }

        try {
            // Step 1: Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
            const user = userCredential.user;

            // Step 2: Call the server action to save user data to Firestore
            const newUser = await addUserToSheet(
                newUserName,
                newUserEmail,
                newUserCourse,
                newUserRole,
                currentUser?.email // Pass creator's email
            );

            toast({
                title: "User Created",
                description: `Successfully created user ${newUserName}.`,
            });

            // Update the local state to show the new user immediately
            setUsers(prevUsers => [...prevUsers, newUser]);

            // Reset form
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserCourse('');
            setNewUserRole('user');
        } catch (error: any) {
            console.error("Error creating user:", error);
            const errorMessage = error.code === 'auth/email-already-in-use'
                ? 'This email address is already in use.'
                : error.message || "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "User Creation Failed",
                description: `Could not create the new user. ${errorMessage}`,
            });
        }
    };

    const handleToggleStatus = async (email: string) => {
        const result = await toggleUserStatus(email);
        if (result.success) {
            toast({
                title: "Status Updated",
                description: `User status for ${email} has been updated.`,
            });
            loadUsers(); // Refresh user list
        } else {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: result.error || "Could not update user status.",
            });
        }
    };

    const handleDeleteUser = async (email: string) => {
        const result = await deleteUserFromSheet(email);
        if (result.success) {
            toast({
                title: "User Deleted",
                description: `User ${email} has been deleted.`,
            });
            loadUsers(); // Refresh user list
        } else {
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: result.error || "Could not delete user.",
            });
        }
    }


    return (
        <ProtectedRoute adminOnly={true}>
            <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-muted/40 p-4 md:p-8">
                <div className="mx-auto grid w-full max-w-2xl gap-4">
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <UserPlus className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Create New User</CardTitle>
                                        <CardDescription>
                                            {currentUser?.role === 'teacher'
                                                ? `Create student accounts (${users.filter(u => u.createdBy === currentUser.email).length}/100)`
                                                : currentUser?.role === 'owner'
                                                    ? `Full access. Create any account type.`
                                                    : `Create student or teacher accounts.`}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="new-user-name">Full Name</Label>
                                    <Input id="new-user-name" placeholder="e.g., John Doe" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-user-email">Email</Label>
                                    <Input id="new-user-email" type="email" placeholder="e.g., john.doe@example.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-user-password">Password</Label>
                                    <Input id="new-user-password" type="password" placeholder="Create a strong password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-user-course">Assigned Course</Label>
                                    <Select value={newUserCourse} onValueChange={setNewUserCourse} required>
                                        <SelectTrigger id="new-user-course">
                                            <SelectValue placeholder="Select a course to assign" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courseCategories.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Role selector for owners and admins, info message for teachers */}
                                {currentUser?.role === 'owner' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-user-role">Role</Label>
                                        <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as 'owner' | 'admin' | 'teacher' | 'user')}>
                                            <SelectTrigger id="new-user-role">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">👤 Student</SelectItem>
                                                <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
                                                <SelectItem value="admin">🛡️ Admin</SelectItem>
                                                <SelectItem value="owner" disabled>👑 Owner (Limit: 1)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Owner has full access • Can create any account type
                                        </p>
                                    </div>
                                ) : currentUser?.role === 'admin' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-user-role">Role</Label>
                                        <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as 'owner' | 'admin' | 'teacher' | 'user')}>
                                            <SelectTrigger id="new-user-role">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">👤 Student</SelectItem>
                                                <SelectItem value="teacher">👨‍🏫 Teacher (Max 5)</SelectItem>
                                                <SelectItem value="admin" disabled>🛡️ Admin (Owner Only)</SelectItem>
                                                <SelectItem value="owner" disabled>👑 Owner (Owner Only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Teachers: {users.filter(u => u.role === 'teacher').length}/5 • Admins can only create students and teachers
                                        </p>
                                    </div>
                                ) : currentUser?.role === 'teacher' ? (
                                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                                        📚 You are creating a <strong>Student</strong> account. Teachers can only create student accounts.
                                    </p>
                                ) : null}
                                <Button type="submit" className="w-full">
                                    {currentUser?.role === 'owner' || currentUser?.role === 'admin'
                                        ? `Create ${newUserRole === 'owner' ? 'Owner' : newUserRole === 'admin' ? 'Admin' : newUserRole === 'teacher' ? 'Teacher' : 'Student'}`
                                        : 'Create Student'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="mt-8 border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <Users className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Manage Users</CardTitle>
                                        <CardDescription>
                                            Activate, deactivate, or delete user accounts.
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 px-3 py-1 text-sm">
                                    {users.length} Total Users
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.slice(0, visibleUsersCount).map((user) => (
                                        <TableRow key={user.email}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                                    user.role === 'owner'
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        : user.role === 'teacher'
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                )}>
                                                    {user.role === 'owner' ? '👑 Owner' : user.role === 'teacher' ? '👨‍🏫 Teacher' : '👤 Student'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Label htmlFor={`status-${user.email}`} className={cn("text-sm", user.active ? "text-green-600" : "text-muted-foreground")}>
                                                        {user.active ? "Active" : "Inactive"}
                                                    </Label>
                                                    <Switch
                                                        id={`status-${user.email}`}
                                                        checked={user.active}
                                                        onCheckedChange={() => handleToggleStatus(user.email)}
                                                        disabled={user.role === 'owner' || user.role === 'teacher'}
                                                        aria-label={`Toggle status for ${user.email}`}
                                                    />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" disabled={user.role === 'owner' || user.role === 'teacher'}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the user
                                                                    account for <span className="font-bold">{user.email}</span>.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUser(user.email)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row border-t mt-4 px-2 bg-slate-50/30 dark:bg-slate-900/10 rounded-b-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Show</p>
                                        <Select
                                            value={usersPageSize.toString()}
                                            onValueChange={(v) => {
                                                const newSize = parseInt(v);
                                                setUsersPageSize(newSize);
                                                setVisibleUsersCount(newSize);
                                            }}
                                        >
                                            <SelectTrigger className="h-9 w-[80px] bg-background border-slate-200 dark:border-slate-800 shadow-sm">
                                                <SelectValue placeholder={usersPageSize.toString()} />
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
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">per increment</p>
                                </div>
                                {visibleUsersCount < users.length && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setVisibleUsersCount((prev) => prev + usersPageSize)}
                                        className="font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-slate-200 dark:border-slate-800"
                                    >
                                        <Plus className="mr-2 h-3.5 w-3.5" />
                                        Show {Math.min(usersPageSize, users.length - visibleUsersCount)} More
                                    </Button>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(Math.min(visibleUsersCount, users.length) / users.length) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        <span className="text-foreground">{Math.min(visibleUsersCount, users.length)}</span>
                                        <span className="mx-1">/</span>
                                        <span>{users.length}</span>
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <Card className="mt-8 border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <LayoutGrid className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Classes Management</CardTitle>
                                        <CardDescription>
                                            Add new grades or special test categories.
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-muted/30 rounded-xl border border-dashed">
                                <div className="grid gap-2">
                                    <Label>Class Name</Label>
                                    <Input placeholder="e.g. Class 10 or AFNS" value={newClassName} onChange={e => setNewClassName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Slug</Label>
                                    <Input placeholder="e.g. class-10 or afns" value={newClassSlug} onChange={e => setNewClassSlug(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select value={newClassCategory} onValueChange={(v: ClassCategory) => setNewClassCategory(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="academic">Academic</SelectItem>
                                            <SelectItem value="special">Special Class</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Icon</Label>
                                    <Select value={newClassIcon} onValueChange={setNewClassIcon}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GraduationCap">🎓 Graduation</SelectItem>
                                            <SelectItem value="Plane">✈️ Plane (PAF)</SelectItem>
                                            <SelectItem value="FlaskConical">🧪 Flask (AFNS)</SelectItem>
                                            <SelectItem value="ShieldCheck">🛡️ Shield (Military)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2 grid gap-2">
                                    <Label>Description</Label>
                                    <Input placeholder="Brief description..." value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} />
                                </div>
                                <Button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="mr-2 h-4 w-4" /> Add New Class
                                </Button>
                            </form>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead className="text-right">Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classesLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4">
                                            <RefreshCw className="h-4 w-4 animate-spin mx-auto text-indigo-500" />
                                        </TableCell></TableRow>
                                    ) : classes.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No classes found</TableCell></TableRow>
                                    ) : classes.map((cls) => (
                                        <TableRow key={cls.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {cls.icon === 'GraduationCap' && <GraduationCap className="h-4 w-4 text-indigo-500" />}
                                                    {cls.icon === 'Plane' && <Plane className="h-4 w-4 text-indigo-500" />}
                                                    {cls.icon === 'FlaskConical' && <FlaskConical className="h-4 w-4 text-indigo-500" />}
                                                    {cls.icon === 'ShieldCheck' && <ShieldCheck className="h-4 w-4 text-indigo-500" />}
                                                    {cls.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={cls.category === 'special' ? 'default' : 'secondary'} className="capitalize">
                                                    {cls.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{cls.slug}</TableCell>
                                            <TableCell className="text-right font-medium">{cls.display_order}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete <strong>{cls.name}</strong>? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteClass(cls.id, cls.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-indigo-500" />
                                        MCQs Management
                                    </CardTitle>
                                    <CardDescription>
                                        Overview of all MCQs in the database by course
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="text-base px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                                        <Database className="mr-2 h-4 w-4" />
                                        {totalMcqs.toLocaleString()} Total
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={loadMcqStats} disabled={mcqLoading}>
                                        <RefreshCw className={cn("h-4 w-4", mcqLoading && "animate-spin")} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {mcqLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : mcqStats.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Database className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No MCQs found in the database</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Course</TableHead>
                                            <TableHead>Subjects</TableHead>
                                            <TableHead className="text-right">Total MCQs</TableHead>
                                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mcqStats.map((course) => (
                                            <TableRow key={course.course_type} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{COURSE_ICONS[course.course_type] || "📚"}</span>
                                                        <span>{COURSE_LABELS[course.course_type] || course.course_type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {course.subjects.slice(0, 5).map((subject) => (
                                                            <Badge key={subject.name} variant="outline" className="text-xs capitalize">
                                                                <BookOpen className="mr-1 h-3 w-3" />
                                                                {subject.name.replace("-", " ")}
                                                                <span className="ml-1 text-muted-foreground">({subject.count})</span>
                                                            </Badge>
                                                        ))}
                                                        {course.subjects.length > 5 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{course.subjects.length - 5} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 dark:from-indigo-900/40 dark:to-purple-900/40 dark:text-indigo-300 dark:border-indigo-800 font-bold px-3 py-1">
                                                        {course.total.toLocaleString()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="ghost" size="sm" className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600">
                                                        <Link href={`/admin/mcqs?course=${course.course_type}`}>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
                                <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-md shadow-green-500/20">
                                    <Link href="/admin/mcqs?action=add">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add MCQ
                                    </Link>
                                </Button>
                                <Button asChild variant="secondary" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md shadow-indigo-500/20">
                                    <Link href="/admin/mcqs">
                                        <Database className="mr-2 h-4 w-4" />
                                        View All MCQs
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <Link href="/admin/exam-generator" className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                                        Generate Exams
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div >
            </div >
        </ProtectedRoute >
    );
}
