import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { RiGoogleFill } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { db } from "../utils/firebase";

const OAuth = () => {
  const router = useRouter();

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' }); // Ensure that Google prompts for account selection
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const displayName = user.displayName;
        const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];
  
        await setDoc(docRef, {
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          timestamp: serverTimestamp(),
          role: "student",
        });
      }
  
      router.push("/");
    } catch (error) {
      toast.error("Could not authorize with Google.");
    }
  };
  

  return (
    <button
      type="button"
      onClick={onGoogleClick}
      className="btn btn-primary d-flex align-items-center justify-content-center w-full"
    >
      <RiGoogleFill className="text-gray-500 text-2xl rounded-circle me-2" />
      Continue with Google
    </button>
  );
};

export default OAuth;
