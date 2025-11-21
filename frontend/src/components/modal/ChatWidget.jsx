import { useEffect, useState, useRef, useCallback } from "react";
import chatService from "../../services/chatService";
import { useAuth } from "../../context/AuthContext";

const PAGE_SIZE = 20; 
const ChatWidget = ({ roomId, liveName }) => {

    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            });
        } catch (e) {
            return '시간 오류';
        }
    };


    const messagesEndRef = useRef(null);
    const chatListRef = useRef(null); 
    
    const { user, isLoggedIn } = useAuth();
    
    const currentUserId = user?.id; 
    const username = user?.username;

    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);

    const [isInitialLoad, setIsInitialLoad] = useState(true); 
    const [page, setPage] = useState(0); 
    
    const scrollToBottom = () => {
        window.requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
    };

    const connectToChat = async (roomId) => {
        if (!roomId) return;
        
        try {
            setMessages([]);
            setPage(0);
            setIsConnected(false); 
            setIsInitialLoad(true); 

            const response = await chatService.fetchChatHistory(roomId, 0, PAGE_SIZE); 
            
            const messageList = Array.isArray(response) ? response : response?.messages ?? [];
            
            const initialMessages = messageList
                .reverse()
                .map(msg => ({
                    ...msg,
                    isMyMessage: currentUserId && String(msg.userId) === String(currentUserId),
                    isOfficialArtist: msg.type === "ARTIST_OFFICIAL",
                    isFanManager: msg.type === "ARTIST_FAN_MANAGER", 
                    isAdmin: msg.type === "ADMIN",
                    isTargetedToMe: currentUserId && msg.targetUserId && msg.targetUserId === currentUserId,
                }));

            setMessages(initialMessages);
            setPage(1); 
            
            await chatService.connect(roomId, (receiveMessage) => {
                const isMyMessage = currentUserId && String(receiveMessage.userId) === String(currentUserId);
                const isOfficialArtist = receiveMessage.type === "ARTIST_OFFICIAL";
                const isFanManager = receiveMessage.type === "ARTIST_FAN_MANAGER"; 
                const isAdmin = receiveMessage.type === "ADMIN";
                const isTargetedToMe = currentUserId && receiveMessage.targetUserId && receiveMessage.targetUserId === currentUserId;

                const messageWithFlags = {
                    ...receiveMessage,
                    isMyMessage,
                    isOfficialArtist,
                    isFanManager,
                    isAdmin,
                    isTargetedToMe,
                };
                
                setMessages(prev => [...prev, messageWithFlags]);
                
                scrollToBottom();
            });

            setIsConnected(true);

        } catch (error) {
            console.error("Failed to connect or load history: ", error);
            setIsConnected(false); 
        }
    };

    useEffect(() => {
        if (isOpen && !isConnected && roomId) { 
            connectToChat(roomId); 
        }

        if (!isOpen && isConnected) {
            chatService.disconnect();
            setIsConnected(false); 
            setMessages([]); 
        }
    }, [isOpen, roomId, currentUserId]); 

    useEffect(() => {
        if (messages.length > 0 && isInitialLoad) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            setIsInitialLoad(false);
            return;
        }

        const chatListElement = chatListRef.current;
        if (!chatListElement || isInitialLoad) return;

        const isNearBottom = chatListElement.scrollHeight - chatListElement.scrollTop <= chatListElement.clientHeight + 100;
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && (lastMessage.isMyMessage || isNearBottom)) {
             scrollToBottom();
        }

    }, [messages.length, isInitialLoad]);


    const sendMessage = (e) => {
        e.preventDefault();
        
        const trimmedMessage = inputMessage.trim();

        if (!isLoggedIn || !currentUserId || !username) {
            console.error("채팅 메시지는 로그인 후 전송할 수 있습니다."); 
            return;
        }

        if (isConnected && trimmedMessage) {
            const tagRegex = /@(\S+)/; 
            const match = trimmedMessage.match(tagRegex);
            
            let targetUserId = null;

            if (match) {
                const targetUsername = match[1]; 
                
                const uniqueUsers = messages.reduce((acc, msg) => {
                    if (msg.sender && msg.userId) {
                        acc[msg.sender] = msg.userId;
                    }
                    return acc;
                }, {});
                
                if (uniqueUsers[targetUsername]) {
                    targetUserId = uniqueUsers[targetUsername];
                } else {
                    console.warn(`[Chat] 멘션 대상(@${targetUsername})의 ID를 찾을 수 없습니다.`);
                }
            }          
            chatService.sendMessage(
                roomId, 
                username, 
                currentUserId, 
                trimmedMessage, 
                targetUserId,
                null
            );
            setInputMessage("");
            
            scrollToBottom();
        }
    };

    const getMessageStyle = (msg) => {
      console.log(msg);
        if (msg.isMyMessage) {
            return "bg-blue-600 text-white";
        }
        if (msg.isAdmin || msg.isOfficialArtist) {
            return "bg-purple-50 border border-purple-200 text-purple-900"; 
        }
        if (msg.isFanManager) {
            return "bg-yellow-50 border border-yellow-200 text-yellow-800";
        }
        return "bg-white border border-gray-200";
    };

    return (
        <>
            {isOpen ? (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">{liveName} 채팅방 </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-700 rounded p-1"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Messages List */}
                    <div 
                        ref={chatListRef}
                        className="flex-1 overflow-y-auto p-4 bg-gray-50" 
                    >
                        {/* 메시지 맵핑 */}
                        {messages.map((msg, index) => (
                            <div key={msg.id || index} className="mb-4">
                                <div className={`flex ${msg.isMyMessage ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-xs rounded-lg p-3 ${getMessageStyle(msg)}`}>
                                        {/* 상대 메시지일 때만 닉네임 표시 */}
                                        {!msg.isMyMessage && (
                                            <div className="text-xs font-semibold mb-1 flex items-center gap-1 flex-wrap">
                                                <span className={msg.isAdmin ? "text-red-700" : (msg.isOfficialArtist ? "text-purple-700" : (msg.isFanManager ? "text-yellow-700" : "text-gray-700"))}>
                                                    {msg.sender || "사용자"} 
                                                </span>
                                                {msg.isAdmin && (<span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs">운영자</span>)}
                                                {msg.isOfficialArtist && (<span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs">공식</span>)}
                                                {msg.isFanManager && (<span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-xs">팬 관리</span>)}
                                                {msg.isTargetedToMe && (<span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-bold">@나</span>)}
                                            </div>
                                        )}
                                        <div className="break-words font-medium">{msg.message}</div>
                                        <div className={`text-xs mt-1 ${msg.isMyMessage ? "text-blue-100 text-right" : "text-gray-500"}`}>
                                            {formatTime(msg.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={isLoggedIn ? "메시지를 입력하세요..." : "채팅은 로그인 후 가능합니다."}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
                                disabled={!isConnected || !isLoggedIn}
                            />
                            <button
                                type="submit"
                                disabled={!isConnected || !inputMessage.trim() || !isLoggedIn}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                전송
                            </button>
                        </div>
                        {!isConnected && (
                            <p className="text-xs text-gray-500 mt-2">연결 중...</p>
                        )}
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                </button>
            )}
        </>
    );
};

export default ChatWidget;