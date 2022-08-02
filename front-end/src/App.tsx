import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/route";

export default function App(){
  return (
    <BrowserRouter>
      <AppRouter currentAddress=''/>
    </BrowserRouter>
  )
}