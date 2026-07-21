import { useLocation } from "react-router-dom";
import ToastMessage from "./components/common/ToastMessage";
import ChatWidget from "./components/chat/ChatWidget";
import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";

const readCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return token && raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function ChatWidgetGate() {
  const location = useLocation();
  const user = readCurrentUser();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdmin = Number(user?.role) === 2;

  if (isAdminRoute || isAdmin) return null;

  return <ChatWidget />;
}

function App() {
  return (
    <NotificationProvider>
      <ToastMessage />
      <AppRoutes />
      <ChatWidgetGate />
    </NotificationProvider>
  );
}

export default App;
