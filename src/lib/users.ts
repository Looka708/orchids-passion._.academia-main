
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface User {
    name: string;
    email: string;
    password?: string;
    course: string;
    role: 'owner' | 'admin' | 'teacher' | 'user';
    active: boolean;
    photoURL?: string;
    bio?: string;
    equippedFrame?: string;
    equippedTheme?: string;
    equippedBadge?: string;
    createdStudents?: number;
    createdBy?: string;
    hasCompletedOnboarding?: boolean;
    goals?: {
        targetGrade?: string;
        dailyStudyTime?: number;
    };
    id?: string;
}

export async function ensureAdminUserExists() {
    const adminEmail = "admin@passion-academia.com";
    const adminRef = doc(db, 'users', adminEmail.toLowerCase());
    const docSnap = await getDoc(adminRef);

    if (!docSnap.exists()) {
        const adminUser: User = {
            name: "Owner",
            email: adminEmail,
            password: "admin123",
            course: "All",
            role: "owner",
            active: true
        };
        await setDoc(adminRef, adminUser);
    }
}

// Ensure the owner user exists when the module is loaded.
// In a server environment this might run multiple times, but merging handles it.
if (typeof window === 'undefined') {
    ensureAdminUserExists();
}

export async function updateUserProfile(email: string, data: Partial<User>): Promise<void> {
    const updates = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(doc(db, 'users', email.toLowerCase()), updates);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const userDoc = await getDoc(doc(db, 'users', email.toLowerCase()));
    if (userDoc.exists()) {
        return userDoc.data() as User;
    }

    // Fallback case-insensitive check
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
    }

    return null;
}

export async function setUserData(user: User): Promise<void> {
    const { password, ...userData } = user;
    await setDoc(doc(db, 'users', user.email.toLowerCase()), userData, { merge: true });
}

export async function toggleUserActiveStatus(email: string): Promise<void> {
    const user = await getUserByEmail(email);
    if (user) {
        if (user.role === 'owner' || user.role === 'teacher') {
            throw new Error("Cannot deactivate an owner or teacher account.");
        }
        await updateDoc(doc(db, 'users', email.toLowerCase()), {
            active: !user.active
        });
    }
}

export async function getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => doc.data() as User);
}

export async function deleteUser(email: string): Promise<void> {
    const user = await getUserByEmail(email);
    if (user) {
        if (user.role === 'owner' || user.role === 'teacher') {
            throw new Error("Cannot delete an owner or teacher account.");
        }
        await deleteDoc(doc(db, 'users', email.toLowerCase()));
    }
}
