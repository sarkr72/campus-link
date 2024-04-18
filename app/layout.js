import { Inter } from "next/font/google";
// import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
// import { Amplify } from "aws-amplify";
// import awsExports from "../aws-exports";
// import "../utils/configureAmplify";
// import "@aws-amplify/ui-react/styles.css";
import Footer from "./components/Footer";
// Amplify.configure({ ...awsExports, ssr: true });
// import config from "../aws-exports";
// import awsExports from "../aws-exports";
// import '../utils/configureAmplify'
// import "@aws-amplify/ui-react/styles.css";
// Amplify.configure(config);
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
