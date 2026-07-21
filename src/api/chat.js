import api from "./axios";

export const searchChatFacilities = (q) =>
  api.get("/chat/facilities", { params: { q } });

export const getChatConversations = () => api.get("/chat/conversations");

export const createChatConversation = (coSoId) =>
  api.post("/chat/conversations", { co_so_id: coSoId });

export const getChatMessages = (conversationId) =>
  api.get(`/chat/conversations/${conversationId}/messages`);

export const sendChatMessage = (conversationId, noiDung, hinhAnh) => {
  if (!hinhAnh) {
    return api.post(`/chat/conversations/${conversationId}/messages`, {
      noi_dung: noiDung,
    });
  }

  const formData = new FormData();
  formData.append("noi_dung", noiDung || "");
  formData.append("hinh_anh", hinhAnh);

  return api.post(`/chat/conversations/${conversationId}/messages`, formData);
};

export const deleteChatConversation = (conversationId) =>
  api.delete(`/chat/conversations/${conversationId}`);
