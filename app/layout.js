import { Inter } from "next/font/google";
// import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header'
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";
import "../utils/configureAmplify";
import "@aws-amplify/ui-react/styles.css";
import Footer from "./components/Footer";

Amplify.configure({ ...awsExports, ssr: true });
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
