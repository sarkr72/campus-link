// Import necessary dependencies
"use client";
import {withAuthenticator} from '@aws-amplify/ui-react'
// import { Amplify } from "aws-amplify";
// import awsExports from "../../../aws-exports";
// import '../../../utils/configureAmplify'
// import "@aws-amplify/ui-react/styles.css";
import LoginForm from '../../components/LoginForm'

// Amplify.configure({ ...awsExports, ssr: true });


const LoginPage = () => {

  return (
    <>
    <LoginForm />
    </>
  );
};

// export default withAuthenticator(LoginPage);
export default LoginPage
