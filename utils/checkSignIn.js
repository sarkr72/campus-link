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
    const email = user.signInDetails?.loginId;
    return user.signInDetails?.loginId;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export default currentUser;

const getCurrentUserEmail = async () => {
  try {
    const user = getCurrentUser();
    // const timeoutPromise = new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(false); // Return false if getCurrentUser takes too long
    //   }, 5000); // Adjust the timeout duration as needed
    // });

    // // Wait for either getCurrentUser or timeoutPromise to resolve
    // const user = await Promise.race([userPromise, timeoutPromise]);
    
    // if (!user) {
    //   console.log('getCurrentUser took too long, returning false');
    //   return false;
    // }

    const email = user?.signInUserSession?.idToken?.payload?.email || false;
    console.log('email', email);
    return email;
  } catch (err) {
    console.log(err);
    return null;
  }
}


export {getCurrentUserEmail};
