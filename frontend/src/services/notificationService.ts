import api from "./api";

export const getNotifications = () => api.get("/notifications");
export const markAsRead = (id: number) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id: number) => api.delete(`/notifications/${id}`);
export const clearAllNotifications = () => api.delete("/notifications/clear");