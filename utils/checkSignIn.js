/*
import { Amplify } from "aws-amplify";
import config from ".././aws-exports";
import "@aws-amplify/ui-react/styles.css";
Amplify.configure(config);
import { getCurrentUser } from 'aws-amplify/auth';
*/

async function currentUser() {
  try {
    const user = await getCurrentUser();
    return user.signInDetails?.loginId;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export default currentUser;