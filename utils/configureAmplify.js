import { Amplify } from "aws-amplify";
import config from "../aws-exports";
// import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
// import { sessionStorage } from "aws-amplify/utils";

import { withSSRContext } from "aws-amplify";
import { Asul } from "next/font/google";
import awsmobile from "../aws-exports";

Amplify.configure(config);

// cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);
