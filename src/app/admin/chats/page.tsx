"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { db, storage } from "@/lib/firebase/config"
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    addDoc,
    serverTimestamp,
    limit
} from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search,
    Send,
    File,
    Image as ImageIcon,
    Paperclip,
    Download,
    Loader2,
    ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ChatListItem {
    id: string
    userName: string
    userEmail: string
    userPhoto?: string
    lastMessage: string
    lastTimestamp: any
    unreadCount: number
}

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

export default function AdminChatPage() {
    const { user } = useAuth()
    const [chats, setChats] = useState<ChatListItem[]>([])
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch all chats
    useEffect(() => {
        const q = query(collection(db, "chats"), orderBy("lastTimestamp", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatListItem[]
            setChats(chatList)
        })
        return () => unsubscribe()
    }, [])

    // Fetch messages for selected chat
    useEffect(() => {
        if (!selectedChatId) return

        const q = query(
            collection(db, "chats", selectedChatId, "messages"),
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
    }, [selectedChatId])

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
        if (!newMessage.trim() || !selectedChatId || !user) return

        const messageData = {
            text: newMessage,
            senderId: user.email,
            senderName: "Support Admin",
            senderPhoto: user.photoURL || "",
            timestamp: serverTimestamp(),
            type: 'text'
        }

        setNewMessage("")
        try {
            await addDoc(collection(db, "chats", selectedChatId, "messages"), messageData)
            await setDoc(doc(db, "chats", selectedChatId), {
                lastMessage: newMessage,
                lastTimestamp: serverTimestamp(),
                unreadCount: 0
            }, { merge: true })
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedChatId || !user) return

        setIsUploading(true)
        const fileType = file.type.startsWith('image/') ? 'image' : 'file'
        const storageRef = ref(storage, `chats/${selectedChatId}/${Date.now()}_${file.name}`)
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
                    senderId: user.email,
                    senderName: "Support Admin",
                    senderPhoto: user.photoURL || "",
                    timestamp: serverTimestamp(),
                    type: fileType,
                    fileUrl: downloadURL,
                    fileName: file.name
                }
                await addDoc(collection(db, "chats", selectedChatId, "messages"), messageData)

                await setDoc(doc(db, "chats", selectedChatId), {
                    lastMessage: fileType === 'image' ? "📷 Image" : `📄 ${file.name}`,
                    lastTimestamp: serverTimestamp(),
                    unreadCount: 0
                }, { merge: true })

                setIsUploading(false)
                setUploadProgress(0)
            }
        )
    }

    const filteredChats = chats.filter(chat =>
        chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedChat = chats.find(c => c.id === selectedChatId)

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
            {/* Sidebar - Chat List */}
            <div className={cn(
                "flex w-full flex-col border-r bg-muted/20 md:w-80",
                selectedChatId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b space-y-4">
                    <h1 className="text-xl font-bold">Support Chats</h1>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="divide-y">
                        {filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={cn(
                                    "flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-accent",
                                    selectedChatId === chat.id && "bg-accent"
                                )}
                            >
                                <div className="flex w-full items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={chat.userPhoto} />
                                            <AvatarFallback>{chat.userName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="font-medium truncate">{chat.userName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{chat.userEmail}</p>
                                        </div>
                                    </div>
                                    {chat.lastTimestamp && (
                                        <span className="shrink-0 text-[10px] text-muted-foreground">
                                            {format(chat.lastTimestamp.toDate(), "HH:mm")}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                    {chat.lastMessage}
                                </p>
                            </button>
                        ))}
                        {filteredChats.length === 0 && (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No chats found
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content - Selected Chat */}
            <div className={cn(
                "flex flex-1 flex-col",
                !selectedChatId ? "hidden md:flex" : "flex"
            )}>
                {selectedChatId && selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-4 border-b bg-background p-4 shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setSelectedChatId(null)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Avatar>
                                <AvatarImage src={selectedChat.userPhoto} />
                                <AvatarFallback>{selectedChat.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-sm font-semibold">{selectedChat.userName}</h2>
                                <p className="text-xs text-muted-foreground">{selectedChat.userEmail}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === user?.email
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full flex-col gap-1.5",
                                                isMe ? "items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex max-w-[70%] items-end gap-2",
                                                isMe ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage src={msg.senderPhoto} />
                                                    <AvatarFallback className="text-xs">
                                                        {msg.senderName.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={cn(
                                                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-br-none"
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
                                                                className="max-h-80 w-full cursor-pointer object-cover transition-transform hover:scale-[1.02]"
                                                                onClick={() => window.open(msg.fileUrl, '_blank')}
                                                            />
                                                        </div>
                                                    )}
                                                    {msg.type === 'file' && (
                                                        <a
                                                            href={msg.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 hover:underline py-1"
                                                        >
                                                            <div className="rounded bg-background/20 p-2">
                                                                <File className="h-5 w-5" />
                                                            </div>
                                                            <span className="truncate max-w-[200px]">{msg.fileName}</span>
                                                            <Download className="h-4 w-4 opacity-50" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="px-10 text-[10px] text-muted-foreground">
                                                {msg.timestamp ? format(msg.timestamp.toDate(), "pp") : "sending..."}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Overlay */}
                        <div className="border-t bg-background p-4">
                            <div className="mx-auto max-w-4xl space-y-4">
                                {isUploading && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground px-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span>Uploading attachment... {Math.round(uploadProgress)}%</span>
                                    </div>
                                )}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-2 rounded-2xl border bg-muted/50 p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 rounded-xl"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a response..."
                                        className="flex-1 border-0 bg-transparent py-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="h-10 px-4 rounded-xl shrink-0 gap-2"
                                    >
                                        <span>Send</span>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/5">
                        <div className="rounded-full bg-primary/10 p-6 mb-4">
                            <MessageSquare className="h-12 w-12 text-primary opacity-50" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight">Select a conversation</h2>
                        <p className="mt-2 text-muted-foreground max-w-xs px-4">
                            Choose a chat from the sidebar to start providing support to your students.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
