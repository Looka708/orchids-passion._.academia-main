
"use server";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { toggleUserActiveStatus, getAllUsers, deleteUser, getUserByEmail, setUserData } from '@/lib/users';
import type { User } from '@/lib/users';

export async function verifyUserInSheet(email: string, password: string): Promise<{ success: boolean; course?: string; name?: string; email?: string, role?: 'owner' | 'admin' | 'teacher' | 'user', active?: boolean }> {
    const user = await getUserByEmail(email);
    if (user && user.password === password) {
        return { success: true, name: user.name, email: user.email, course: user.course, role: user.role, active: user.active };
    }
    return { success: false };
}

export async function addUserToSheet(name: string, email: string, course: string, role: 'owner' | 'admin' | 'teacher' | 'user', createdBy?: string): Promise<User> {
    try {
        const newUser: User = { name, email, course, role, active: true, createdBy };
        await setUserData(newUser);
        return newUser;
    } catch (error: any) {
        console.error("Error saving user to Firestore:", error);
        throw new Error(error.message || "An unknown error occurred while saving user data.");
    }
}

export async function fetchUsers(currentUserEmail?: string, currentUserRole?: 'owner' | 'admin' | 'teacher' | 'user') {
    const allUsers = await getAllUsers();

    // If teacher, only return users they created
    if (currentUserRole === 'teacher' && currentUserEmail) {
        return allUsers.filter(user => user.createdBy === currentUserEmail);
    }

    // Owners and admins see all users
    return allUsers;
}

export async function toggleUserStatus(email: string) {
    try {
        await toggleUserActiveStatus(email);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUserFromSheet(email: string) {
    try {
        // IMPORTANT: Deleting a user from Firebase Authentication requires admin privileges
        // and should be handled in a secure backend environment (e.g., Firebase Cloud Functions),
        // not directly from the client. The following `deleteUser` function only removes
        // the user from the Firestore database.

        // The current implementation will only delete the user from the Firestore database.
        // To fully delete the user, you must implement a backend function that uses the
        // Firebase Admin SDK to delete the user from Firebase Authentication.

        await deleteUser(email);

        // This is a placeholder for where you would call your backend function.
        // For now, we will proceed with only deleting from Firestore.
        // Example of what the backend call could look like:
        // const response = await fetch('/api/delete-user', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email }),
        // });
        // if (!response.ok) {
        //   throw new Error('Failed to delete user from Firebase Auth.');
        // }

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error.message);
        return { success: false, error: "Deletion failed. Note: Full user deletion requires a backend implementation. This action only removed the user from the database." };
    }
}
