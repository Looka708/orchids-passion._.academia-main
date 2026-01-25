"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { db, storage } from "@/lib/firebase/config"
import { getAIResponse } from "@/app/actions"
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit,
    where,
    doc,
    setDoc,
    getDoc
} from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import {
    MessageSquare,
    X,
    Send,
    Paperclip,
    Image as ImageIcon,
    File,
    Loader2,
    Download,
    Smile,
    MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Message {
    id: string
    text?: string
    senderId: string
    senderName: string
    senderPhoto?: string
    timestamp: any
    type: 'text' | 'image' | 'file'
    fileUrl?: string
    fileName?: string
}

export default function LiveChat() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const [chatId, setChatId] = useState<string>("anonymous_guest")

    useEffect(() => {
        if (user?.email) {
            setChatId(user.email.replace(/\./g, '_'))
        } else {
            let guestId = localStorage.getItem("chat_guest_id")
            if (!guestId) {
                guestId = `guest_${Math.random().toString(36).substring(2, 11)}`
                localStorage.setItem("chat_guest_id", guestId)
            }
            setChatId(guestId)
        }
    }, [user])

    useEffect(() => {
        if (!isOpen) return

        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "asc"),
            limit(100)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[]
            setMessages(msgs)
            scrollToBottom()
        })

        return () => unsubscribe()
    }, [isOpen, chatId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || !chatId) return

        const messageData = {
            text: newMessage,
            senderId: user?.email || "guest",
            senderName: user?.name || "Guest User",
            senderPhoto: user?.photoURL || "",
            timestamp: serverTimestamp(),
            type: 'text'
        }

        setNewMessage("")
        try {
            await addDoc(collection(db, "chats", chatId, "messages"), messageData)
            // Update chat metadata for admin view
            await setDoc(doc(db, "chats", chatId), {
                lastMessage: newMessage,
                lastTimestamp: serverTimestamp(),
                userName: user?.name || "Guest User",
                userEmail: user?.email || "guest",
                userPhoto: user?.photoURL || "",
                unreadCount: 0
            }, { merge: true })

            // Get AI Response
            setIsTyping(true)
            const history = messages.slice(-5).map(m => ({
                role: m.senderId === (user?.email || "guest") ? 'user' : 'assistant' as 'user' | 'assistant',
                content: m.text || ""
            }))

            const aiResult = await getAIResponse(newMessage, history)

            if (aiResult.success && aiResult.text) {
                const aiMessageData = {
                    text: aiResult.text,
                    senderId: "ai_bot",
                    senderName: "Passion AI (DeepSeek-R1)",
                    senderPhoto: "/logo.png",
                    timestamp: serverTimestamp(),
                    type: 'text'
                }
                await addDoc(collection(db, "chats", chatId, "messages"), aiMessageData)

                await setDoc(doc(db, "chats", chatId), {
                    lastMessage: aiResult.text,
                    lastTimestamp: serverTimestamp(),
                }, { merge: true })
            } else {
                toast({
                    variant: "destructive",
                    title: "Support System Busy",
                    description: aiResult.error || "The AI is currently unavailable. Please try again in a moment.",
                })
            }
        } catch (error) {
            console.error("Error sending message:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send message. Please check your connection.",
            })
        } finally {
            setIsTyping(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !chatId) return

        setIsUploading(true)
        const fileType = file.type.startsWith('image/') ? 'image' : 'file'
        const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setUploadProgress(progress)
            },
            (error) => {
                console.error("Upload failed:", error)
                setIsUploading(false)
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                const messageData = {
                    senderId: user?.email || "guest",
                    senderName: user?.name || "Guest User",
                    senderPhoto: user?.photoURL || "",
                    timestamp: serverTimestamp(),
                    type: fileType,
                    fileUrl: downloadURL,
                    fileName: file.name
                }
                await addDoc(collection(db, "chats", chatId, "messages"), messageData)

                // Update chat metadata for admin view
                await setDoc(doc(db, "chats", chatId), {
                    lastMessage: fileType === 'image' ? "📷 Image" : `📄 ${file.name}`,
                    lastTimestamp: serverTimestamp(),
                    userName: user?.name || "Guest User",
                    userEmail: user?.email || "guest",
                    userPhoto: user?.photoURL || "",
                    unreadCount: 0
                }, { merge: true })

                setIsUploading(false)
                setUploadProgress(0)
            }
        )
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
                                        <AvatarImage src="/logo.png" />
                                        <AvatarFallback>PA</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold leading-none">Passion Academia Support System</h3>
                                    <p className="mt-1 text-xs opacity-90">DeepSeek-R1 AI Online</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-primary-foreground hover:bg-primary-foreground/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                            <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Hello! How can we help you today?
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === (user?.email || "guest")
                                    const isAI = msg.senderId === "ai_bot"
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full flex-col gap-1",
                                                isMe ? "items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex max-w-[85%] items-end gap-2",
                                                isMe ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <Avatar className={cn("h-6 w-6 shrink-0", isAI && "border border-primary/20")}>
                                                    <AvatarImage src={isAI ? "/logo.png" : msg.senderPhoto} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {isAI ? "AI" : msg.senderName.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={cn(
                                                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                                            : isAI
                                                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-foreground border border-indigo-100 dark:border-indigo-800 rounded-bl-none"
                                                                : "bg-muted text-foreground rounded-bl-none"
                                                    )}
                                                >
                                                    {msg.type === 'text' && (
                                                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                                    )}
                                                    {msg.type === 'image' && (
                                                        <div className="group relative overflow-hidden rounded-lg">
                                                            <img
                                                                src={msg.fileUrl}
                                                                alt="Shared image"
                                                                className="max-h-60 w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                                                onClick={() => window.open(msg.fileUrl, '_blank')}
                                                            />
                                                        </div>
                                                    )}
                                                    {msg.type === 'file' && (
                                                        <a
                                                            href={msg.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 hover:underline"
                                                        >
                                                            <File className="h-4 w-4" />
                                                            <span className="truncate max-w-[150px]">{msg.fileName}</span>
                                                            <Download className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="px-8 text-[10px] text-muted-foreground">
                                                {msg.timestamp ? format(msg.timestamp.toDate(), "p") : "sending..."}
                                            </span>
                                        </div>
                                    )
                                })}
                                {isTyping && (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 shrink-0">
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">AI</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-none flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="border-t p-4 space-y-3 bg-muted/30">
                            {isUploading && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Uploading {Math.round(uploadProgress)}%</span>
                                </div>
                            )}
                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-2 bg-background rounded-xl border p-1 shadow-sm"
                            >
                                <div className="flex items-center gap-1 px-1 border-r">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />
                                </div>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-9"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    className="h-8 w-8 rounded-lg shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors duration-300",
                    isOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                )}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <div className="relative">
                        <MessageSquare className="h-6 w-6" />
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-foreground opacity-50"></span>
                        </span>
                    </div>
                )}
            </motion.button>
        </div>
    )
}
