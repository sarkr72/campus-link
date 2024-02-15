"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports";

import "@aws-amplify/ui-react/styles.css";
import "../styles/globals.css";

Amplify.configure({ ...awsExports, ssr: true });

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;