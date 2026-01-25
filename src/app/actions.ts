
"use server";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { toggleUserActiveStatus, getAllUsers, deleteUser, getUserByEmail, setUserData } from '@/lib/users';
import type { User } from '@/lib/users';
import { Resend } from 'resend';
import { openRouterClient } from "@/lib/openrouter";




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

export async function sendVerificationEmail(email: string, name: string, code: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log(`[VERIFICATION] Sending ${code} to ${email}`);
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing from environment variables");
        return { success: false, error: "Email service configuration missing." };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Passion Academia <verify@passionacademia.ac.pk>',
            to: email,
            subject: `${code} is your verification code`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #4f46e5; text-align: center;">Passion Academia</h2>
                    <p>Hi ${name},</p>
                    <p>Welcome to Passion Academia! To complete your registration, please use the following 9-char verification code:</p>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${code}</span>
                    </div>
                    <p style="font-size: 14px; color: #64748b; text-align: center;">This code will expire in 15 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't request this email, you can safely ignore it.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error: error.message };
        }

        console.log("Resend Success:", data);
        return { success: true };
    } catch (error: any) {
        console.error("Critical Email Sending Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getAIResponse(message: string, history: { role: 'user' | 'assistant' | 'system', content: string }[]) {
    try {
        const systemPrompt = `You are the Official AI Support Assistant for Passion Academia. 
Passion Academia is an advanced educational platform for students (Grades 6-12) and competitive exam aspirants (AFNS, PAF, MCJ, MCM).
Your goal is to provide helpful, professional, and accurate support. 
If the user asks about technical issues, academic content, or platform features, help them directly.
Be polite and encouraging. 
Always refer to yourself as "Passion Support Bot".`;

        // Fallback sequence for best reliability
        const models = [
            "deepseek/deepseek-r1:free",
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3.3-70b-instruct:free"
        ];

        let response = "";
        let lastError = null;

        for (const model of models) {
            try {
                response = await openRouterClient.generateCompletion(message, systemPrompt, {
                    model: model,
                    temperature: 0.7,
                    max_tokens: 1000
                });
                if (response && !response.includes("API key is missing")) break;
            } catch (err) {
                lastError = err;
                continue;
            }
        }

        if (!response || response.includes("API key is missing")) {
            throw new Error("AI Service Unavailable");
        }

        return { success: true, text: response };
    } catch (error: any) {
        console.error("AI Response Error:", error);
        return { success: false, error: "AI is currently resting. Please try again later." };
    }
}
