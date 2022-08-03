import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/route";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        closeButton={true}
        closeOnClick={true}
        pauseOnFocusLoss={true}
        theme="colored"
        enableMultiContainer={false}
      />
      <AppRouter currentAddress="" />
    </BrowserRouter>
  );
}
