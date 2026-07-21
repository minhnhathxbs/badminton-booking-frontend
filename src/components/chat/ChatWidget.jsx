import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createChatConversation,
  deleteChatConversation,
  getChatConversations,
  getChatMessages,
  searchChatFacilities,
  sendChatMessage,
} from "../../api/chat";
import { getAssetUrl } from "../../api/axios";
import { getSocket } from "../../api/socket";
import { showToast } from "../common/ToastMessage";

const readCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return token && raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getConversationTitle = (conversation, currentUserId) => {
  if (!conversation) return "Chat";

  if (Number(conversation.khach_hang_id) === Number(currentUserId)) {
    return conversation.ten_chu_san || "Chu san";
  }

  return conversation.ten_khach_hang || "Khach hang";
};

const getConversationAvatar = (conversation, currentUserId) => {
  if (!conversation) return "";

  if (Number(conversation.khach_hang_id) === Number(currentUserId)) {
    return conversation.avatar_chu_san || "";
  }

  return conversation.avatar_khach_hang || "";
};

const getInitial = (name) => String(name || "C").trim().charAt(0).toUpperCase();

const appendUniqueMessage = (messages, message) => {
  if (!message?.id || messages.some((item) => item.id === message.id)) {
    return messages;
  }

  return [...messages, message];
};

const getMessagePreview = (message) =>
  message?.noi_dung || (message?.hinh_anh_url ? "[Hình ảnh]" : "");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => readCurrentUser());
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [query, setQuery] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentFacility, setCurrentFacility] = useState(null);
  const [typingConversationId, setTypingConversationId] = useState(null);
  const [widgetPosition, setWidgetPosition] = useState(null);
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const remoteTypingTimerRef = useRef(null);
  const dragStateRef = useRef(null);
  const dragMovedRef = useRef(false);

  const userId = user?.id ?? null;
  const isOwner = Number(user?.role) === 1;
  const isAdmin = Number(user?.role) === 2;

  const activeTitle = useMemo(
    () => getConversationTitle(activeConversation, userId),
    [activeConversation, userId],
  );
  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );
  const unreadTotal = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + Number(conversation.so_chua_doc || 0),
        0,
      ),
    [conversations],
  );
  const widgetStyle = widgetPosition
    ? {
        left: `${widgetPosition.x}px`,
        top: `${widgetPosition.y}px`,
      }
    : undefined;

  const refreshUser = useCallback(() => {
    setUser(readCurrentUser());
  }, []);

  const loadConversations = useCallback(async () => {
    if (!localStorage.getItem("token")) return;

    setLoadingList(true);
    try {
      const res = await getChatConversations();
      setConversations(res.data?.danh_sach || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Không tải được tin nhắn", "error");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const openConversation = useCallback(async (conversation) => {
    if (!conversation?.id) return;

    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setActiveConversation(conversation);
    setMessages([]);
    setLoadingMessages(true);
    getSocket()?.emit("chat:join", { conversation_id: conversation.id });

    try {
      const res = await getChatMessages(conversation.id);
      setMessages(res.data?.danh_sach || []);
      setConversations((items) =>
        items.map((item) =>
          item.id === conversation.id ? { ...item, so_chua_doc: 0 } : item,
        ),
      );
    } catch (error) {
      showToast(error.response?.data?.message || "Không tải được nội dung chat", "error");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const startConversationFromFacility = async (facility) => {
    if (!facility?.id) return;

    try {
      const res = await createChatConversation(facility.id);
      const conversation = res.data;

      setConversations((items) => {
        const exists = items.some((item) => item.id === conversation.id);
        return exists
          ? items.map((item) => (item.id === conversation.id ? conversation : item))
          : [conversation, ...items];
      });

      setQuery("");
      setFacilities([]);
      await openConversation(conversation);
    } catch (error) {
      showToast(error.response?.data?.message || "Không mở được cuộc chat", "error");
    }
  };

  const handleSend = async () => {
    const text = content.trim();
    const selectedImage = imageFile;
    if ((!text && !selectedImage) || !activeConversation?.id || sending) return;

    const socket = getSocket();
    socket?.emit("chat:typing", {
      conversation_id: activeConversation.id,
      is_typing: false,
    });
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    setSending(true);
    setContent("");
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    try {
      const res = await sendChatMessage(activeConversation.id, text, selectedImage);
      const message = res.data?.message;
      const conversation = res.data?.conversation;

      if (message) {
        setMessages((items) => appendUniqueMessage(items, message));
      }

      if (conversation) {
        setActiveConversation(conversation);
        setConversations((items) => {
          const next = items.filter((item) => item.id !== conversation.id);
          return [conversation, ...next];
        });
      }
    } catch (error) {
      setContent(text);
      setImageFile(selectedImage);
      showToast(error.response?.data?.message || "Không gửi được tin nhắn", "error");
    } finally {
      setSending(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Chỉ hỗ trợ gửi hình ảnh", "error");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const clearSelectedImage = () => {
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const getClampedPosition = useCallback((x, y) => {
    const rect = widgetRef.current?.getBoundingClientRect();
    const width = rect?.width || 56;
    const height = rect?.height || 56;
    const padding = 12;

    return {
      x: clamp(x, padding, window.innerWidth - width - padding),
      y: clamp(y, padding, window.innerHeight - height - padding),
    };
  }, []);

  const handleDragStart = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    dragMovedRef.current = false;
  };

  const handleDragMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const nextX = dragState.originX + event.clientX - dragState.startX;
    const nextY = dragState.originY + event.clientY - dragState.startY;
    if (
      Math.abs(event.clientX - dragState.startX) > 3 ||
      Math.abs(event.clientY - dragState.startY) > 3
    ) {
      dragMovedRef.current = true;
    }
    setWidgetPosition(getClampedPosition(nextX, nextY));
  };

  const handleDragEnd = (event) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handleContentChange = (event) => {
    const value = event.target.value;
    setContent(value);

    if (!activeConversation?.id) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("chat:typing", {
      conversation_id: activeConversation.id,
      is_typing: Boolean(value.trim()),
    });

    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
    }

    typingStopTimerRef.current = window.setTimeout(() => {
      socket.emit("chat:typing", {
        conversation_id: activeConversation.id,
        is_typing: false,
      });
      typingStopTimerRef.current = null;
    }, 1200);
  };

  const handleDeleteConversation = async (conversation, event) => {
    event.stopPropagation();

    if (!conversation?.id) return;
    setDeleteTarget(conversation);
  };

  const confirmDeleteConversation = async () => {
    const conversation = deleteTarget;
    if (!conversation?.id) return;

    try {
      await deleteChatConversation(conversation.id);
      setConversations((items) =>
        items.filter((item) => item.id !== conversation.id),
      );

      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null);
        setMessages([]);
      }

      showToast("Đã xóa cuộc trò chuyện", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Không xóa được cuộc chat", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    window.addEventListener("storage", refreshUser);
    window.addEventListener("userUpdated", refreshUser);
    window.addEventListener("focus", refreshUser);

    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("userUpdated", refreshUser);
      window.removeEventListener("focus", refreshUser);
    };
  }, [refreshUser]);

  useEffect(() => {
    const onFacilityContext = (event) => {
      const facility = event.detail;
      if (!facility?.id) return;
      setCurrentFacility(facility);
    };

    const clearFacilityContext = () => setCurrentFacility(null);

    window.addEventListener("chat:facility-context", onFacilityContext);
    window.addEventListener("chat:facility-context-clear", clearFacilityContext);

    return () => {
      window.removeEventListener("chat:facility-context", onFacilityContext);
      window.removeEventListener(
        "chat:facility-context-clear",
        clearFacilityContext,
      );
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [loadConversations, user]);

  useEffect(() => {
    if (open) {
      refreshUser();
    }
  }, [open, refreshUser]);

  useEffect(() => {
    if (!open || !user || isOwner || isAdmin || query.trim().length < 2) {
      setFacilities([]);
      return undefined;
    }

    const timerId = setTimeout(async () => {
      try {
        const res = await searchChatFacilities(query.trim());
        setFacilities(res.data?.danh_sach || []);
      } catch {
        setFacilities([]);
      }
    }, 350);

    return () => clearTimeout(timerId);
  }, [isAdmin, isOwner, open, query, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversation?.id]);

  useEffect(() => {
    if (!widgetPosition) return undefined;

    const keepWidgetInView = () => {
      setWidgetPosition((position) =>
        position ? getClampedPosition(position.x, position.y) : position,
      );
    };

    window.addEventListener("resize", keepWidgetInView);
    return () => window.removeEventListener("resize", keepWidgetInView);
  }, [getClampedPosition, widgetPosition]);

  useEffect(() => {
    if (imagePreviewUrl) {
      return () => URL.revokeObjectURL(imagePreviewUrl);
    }

    return undefined;
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!user || !conversations.length) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    const joinRooms = () => {
      conversations.forEach((conversation) => {
        socket.emit("chat:join", { conversation_id: conversation.id });
      });
    };

    joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
      conversations.forEach((conversation) => {
        socket.emit("chat:leave", { conversation_id: conversation.id });
      });
    };
  }, [conversations, user]);

  useEffect(() => {
    if (!userId) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    const joinUserRoom = () => {
      socket.emit("notification:join", { nguoi_dung_id: userId });
    };

    joinUserRoom();
    socket.on("connect", joinUserRoom);

    return () => {
      socket.off("connect", joinUserRoom);
    };
  }, [userId]);

  useEffect(() => {
    if (!user) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    const onNewMessage = ({ message, conversation }) => {
      if (!message || !conversation) return;

      setConversations((items) => {
        const current = items.find((item) => item.id === conversation.id);
        const isReading = open && activeConversation?.id === conversation.id;
        const nextConversation = {
          ...(current || conversation),
          ...conversation,
          tin_nhan_cuoi: getMessagePreview(message),
          thoi_gian_tin_cuoi: message.ngay_tao,
          so_chua_doc:
            isReading || Number(message.nguoi_gui_id) === Number(userId)
              ? 0
              : Number(current?.so_chua_doc || 0) + 1,
        };

        return [
          nextConversation,
          ...items.filter((item) => item.id !== conversation.id),
        ];
      });

      if (open && activeConversation?.id === conversation.id) {
        setTypingConversationId(null);
        setMessages((items) => appendUniqueMessage(items, message));
      }
    };

    socket.on("chat:message-new", onNewMessage);
    return () => socket.off("chat:message-new", onNewMessage);
  }, [activeConversation?.id, open, user, userId]);

  useEffect(() => {
    if (!open || !user) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    const onTyping = ({ conversation_id, nguoi_dung_id, is_typing }) => {
      if (Number(nguoi_dung_id) === Number(userId)) return;

      if (remoteTypingTimerRef.current) {
        window.clearTimeout(remoteTypingTimerRef.current);
        remoteTypingTimerRef.current = null;
      }

      if (is_typing) {
        setTypingConversationId(Number(conversation_id));
        remoteTypingTimerRef.current = window.setTimeout(() => {
          setTypingConversationId(null);
          remoteTypingTimerRef.current = null;
        }, 1800);
      } else {
        setTypingConversationId(null);
      }
    };

    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:typing", onTyping);
      if (remoteTypingTimerRef.current) {
        window.clearTimeout(remoteTypingTimerRef.current);
        remoteTypingTimerRef.current = null;
      }
    };
  }, [open, user, userId]);

  useEffect(() => {
    return () => {
      if (typingStopTimerRef.current) {
        window.clearTimeout(typingStopTimerRef.current);
      }
      if (remoteTypingTimerRef.current) {
        window.clearTimeout(remoteTypingTimerRef.current);
      }
    };
  }, []);

  const renderConversationList = () => (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {loadingList ? (
        <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
      ) : conversations.length ? (
        conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => openConversation(conversation)}
            className="group flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-sky-50"
          >
            {getConversationAvatar(conversation, userId) ? (
              <img
                src={getAssetUrl(getConversationAvatar(conversation, userId))}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                {getInitial(getConversationTitle(conversation, userId))}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {getConversationTitle(conversation, userId)}
                </div>
                {conversation.so_chua_doc > 0 && (
                  <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {conversation.so_chua_doc}
                  </span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => handleDeleteConversation(conversation, event)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      handleDeleteConversation(conversation, event);
                    }
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Delete conversation"
                >
                  <i className="fa-regular fa-trash-can text-xs"></i>
                </span>
              </div>
              <div className="truncate text-xs font-medium text-sky-700">
                {conversation.ten_co_so}
              </div>
              <div className="mt-1 truncate text-xs text-gray-500">
                {conversation.tin_nhan_cuoi || "Chưa có tin nhắn"}
              </div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          Chưa có cuộc chat nào
        </div>
      )}
    </div>
  );

  const renderPanel = () => {
    if (!user) {
      return (
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="text-base font-bold text-gray-900">Tin nhắn</div>
          </div>
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-500">
            Đăng nhập để chat với chủ sân.
          </div>
        </div>
      );
    }

    if (activeConversation) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-3">
            <button
              type="button"
              onClick={() => {
                clearSelectedImage();
                setActiveConversation(null);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
              aria-label="Back"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            {getConversationAvatar(activeConversation, userId) ? (
              <img
                src={getAssetUrl(getConversationAvatar(activeConversation, userId))}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                {getInitial(activeTitle)}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-gray-900">
                {activeTitle}
              </div>
              <div className="truncate text-xs text-sky-700">
                {typingConversationId === activeConversation.id
                  ? "Đang nhập..."
                  : activeConversation.ten_co_so}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-3 pb-7 pt-4">
            {loadingMessages ? (
              <div className="text-center text-sm text-gray-500">Đang tải...</div>
            ) : messages.length ? (
              messages.map((message) => {
                const mine = Number(message.nguoi_gui_id) === Number(userId);
                const imageUrl = message.hinh_anh_url
                  ? getAssetUrl(message.hinh_anh_url)
                  : "";

                return (
                  <div
                    key={message.id}
                    className={`mb-3 flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                  >
                    {!mine &&
                      (message.avatar_nguoi_gui ? (
                        <img
                          src={getAssetUrl(message.avatar_nguoi_gui)}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-sky-700 shadow-sm">
                          {getInitial(message.ten_nguoi_gui)}
                        </div>
                      ))}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        mine
                          ? "rounded-br-md bg-sky-600 text-white"
                          : "rounded-bl-md bg-white text-gray-900"
                      }`}
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Hình ảnh trong tin nhắn"
                          className="mb-2 max-h-52 w-full rounded-xl object-cover"
                        />
                      )}
                      {message.noi_dung && (
                        <div className="whitespace-pre-wrap break-words">
                          {message.noi_dung}
                        </div>
                      )}
                      <div
                        className={`mt-1 text-right text-[10px] ${
                          mine ? "text-sky-100" : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.ngay_tao)}
                      </div>
                    </div>
                    {mine &&
                      (message.avatar_nguoi_gui ? (
                        <img
                          src={getAssetUrl(message.avatar_nguoi_gui)}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 shadow-sm">
                          {getInitial(message.ten_nguoi_gui)}
                        </div>
                      ))}
                  </div>
                );
              })
            ) : (
              <div className="pt-8 text-center text-sm text-gray-500">
                Bắt đầu cuộc trò chuyện
              </div>
            )}
            {typingConversationId === activeConversation.id && (
              <div className="mb-5 flex items-end gap-2">
                {getConversationAvatar(activeConversation, userId) ? (
                  <img
                    src={getAssetUrl(getConversationAvatar(activeConversation, userId))}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-sky-700 shadow-sm">
                    {getInitial(activeTitle)}
                  </div>
                )}
                <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                  Đang nhập...
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            {imagePreviewUrl && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                <img
                  src={imagePreviewUrl}
                  alt="Ảnh đã chọn"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 text-xs font-medium text-gray-600">
                  <div className="truncate">{imageFile?.name}</div>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                  aria-label="Remove image"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:bg-gray-100 disabled:text-gray-300"
                aria-label="Choose image"
              >
                <i className="fa-regular fa-image text-sm"></i>
              </button>
              <textarea
                value={content}
                onChange={handleContentChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Nhập tin nhắn..."
                className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={(!content.trim() && !imageFile) || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md transition hover:bg-sky-700 disabled:bg-gray-300"
                aria-label="Send"
              >
                <i className="fa-regular fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="text-base font-bold text-gray-900">Tin nhắn</div>
          {!isOwner && !isAdmin && currentFacility?.id && (
            <button
              type="button"
              onClick={() => startConversationFromFacility(currentFacility)}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3 text-left transition hover:border-sky-200 hover:bg-sky-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
                <i className="fa-regular fa-comment-dots text-sm"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-sky-900">
                  Chat với chủ sân này
                </div>
                <div className="truncate text-xs font-medium text-sky-700">
                  {currentFacility.ten}
                </div>
              </div>
            </button>
          )}
          {!isOwner && !isAdmin && (
            <div className="mt-3 flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
              <i className="fa-solid fa-magnifying-glass mr-2 text-xs text-gray-400"></i>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên cơ sở..."
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          )}
        </div>

        {!isOwner && !isAdmin && query.trim().length >= 2 && (
          <div className="max-h-52 overflow-y-auto border-b border-gray-200 bg-white">
            {facilities.length ? (
              facilities.map((facility) => (
                <button
                  key={facility.id}
                  type="button"
                  onClick={() => startConversationFromFacility(facility)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-sky-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">
                    CS
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {facility.ten}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {facility.dia_chi || facility.tinh_thanh || "Cơ sở"}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-sm text-gray-500">
                Không tìm thấy cơ sở
              </div>
            )}
          </div>
        )}

        {renderConversationList()}
      </div>
    );
  };

  return (
    <div
      ref={widgetRef}
      style={widgetStyle}
      className={`fixed z-[9998] font-sans ${
        widgetPosition ? "" : "bottom-5 right-5"
      }`}
    >
      {open && (
        <div className="absolute bottom-16 right-0 h-[min(620px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="relative h-full">
            {renderPanel()}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close chat"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        onClick={() => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }

          setOpen((value) => !value);
        }}
        className="relative ml-auto flex h-14 w-14 touch-none items-center justify-center rounded-full bg-sky-600 text-white shadow-xl transition hover:bg-sky-700"
        aria-label="Open chat"
      >
        <i className={`fa-regular ${open ? "fa-comment-dots" : "fa-comments"} text-xl`}></i>
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-xs font-bold leading-none text-white">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>

      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-2 text-base font-bold text-gray-900">
              Xóa cuộc trò chuyện?
            </div>
            <div className="text-sm leading-6 text-gray-500">
              Tin nhắn trong cuộc trò chuyện này sẽ bị xóa.
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
