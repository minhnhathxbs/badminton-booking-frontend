import ToastMessage from "./components/common/ToastMessage";
import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <ToastMessage />
      <AppRoutes />
    </NotificationProvider>
  );
}

export default App;
