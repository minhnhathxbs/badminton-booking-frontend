import ToastMessage from "./components/common/ToastMessage";
import ChatWidget from "./components/chat/ChatWidget";
import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <ToastMessage />
      <AppRoutes />
      <ChatWidget />
    </NotificationProvider>
  );
}

export default App;
