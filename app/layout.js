import { Inter } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer";
import '@fortawesome/fontawesome-free/css/all.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Campus Link",
  description: "Your Learning Adventure Starts Here.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
