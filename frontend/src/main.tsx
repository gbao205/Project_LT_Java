import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme } from "@mui/material/styles";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
export const staffTheme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
    // Định nghĩa các mức độ đậm nhạt riêng cho Staff
    h4: { fontWeight: 900, letterSpacing: "-0.02em" },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    body2: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          textTransform: "none", // Staff không thích nút viết hoa toàn bộ
        },
      },
    },
  },
});
