import api from "./axios";

export const searchChatFacilities = (q) =>
  api.get("/chat/facilities", { params: { q } });

export const getChatConversations = () => api.get("/chat/conversations");

export const createChatConversation = (coSoId) =>
  api.post("/chat/conversations", { co_so_id: coSoId });

export const getChatMessages = (conversationId) =>
  api.get(`/chat/conversations/${conversationId}/messages`);

export const sendChatMessage = (conversationId, noiDung) =>
  api.post(`/chat/conversations/${conversationId}/messages`, {
    noi_dung: noiDung,
  });

export const deleteChatConversation = (conversationId) =>
  api.delete(`/chat/conversations/${conversationId}`);
