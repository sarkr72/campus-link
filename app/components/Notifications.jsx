import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase"; // Assuming db is your Firestore database instance
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ListGroup, Image, Button } from "react-bootstrap";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [retrivedRequests, setRetrivedRequests] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        setUser(userDoc?.data());
        setRetrivedRequests(userDoc?.data()?.friendRequests);
        console.log(userDoc.data().notifications);
      }
    });
  }, []);

  const handleConfirm = async (e, id, name, profilePicture) => {
    e.preventDefault();
    const userRef = doc(db, "users", user?.id);
    const userDoc = await getDoc(userRef);
    const updatedFriendRequests = retrivedRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== id;
    });
    setRetrivedRequests(updatedFriendRequests);
    await updateDoc(
      userDoc.ref,
      {
        friends: arrayUnion({
          name: name,
          id: id,
          profilePicture: profilePicture?.url || null,
          timestamp: new Date(),
        }),
        friendRequests: updatedFriendRequests,
      },
      { merge: true }
    );

    const userrRef = doc(db, "users", id);
    const userrDoc = await getDoc(userrRef);
    const sentRequests = userrDoc?.data()?.friendRequestsSent;
    const updateddFriendRequests2 = sentRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== user?.id;
    });
    await updateDoc(
      userrDoc.ref,
      {
        friends: arrayUnion({
          name: user?.firstName + " " + user?.lastName,
          id: user?.id,
          profilePicture: user?.profilePicture?.url || null,
          timestamp: new Date(),
        }),
        friendRequestsSent: updateddFriendRequests2,
      },
      { merge: true }
    );
    console.log("Friend request accepted successfully.");
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const userRef = doc(db, "users", user?.id);
    const userDoc = await getDoc(userRef);
    const updatedFriendRequests = retrivedRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== id;
    });
    setRetrivedRequests(updatedFriendRequests);
    await updateDoc(userDoc.ref, {
      friendRequests: updatedFriendRequests,
    });
    const userrRef = doc(db, "users", id);
    const userrDoc = await getDoc(userrRef);
    const sentRequests = userrDoc?.data()?.friendRequestsSent;
    const updateddFriendRequests = sentRequests?.filter((request) => {
      const [, requestUserId] = request.split(",");
      return requestUserId !== user?.id;
    });
    await updateDoc(userrDoc.ref, {
      friendRequestsSent: updateddFriendRequests,
    });
    console.log("Friend request canceled successfully.");
  };

  return (
    <div>
      {user && user?.notifications && (
        <ListGroup>
          {user.notifications.map((notification, index) => (
            <ListGroup.Item key={index}>
              <div className="d-flex align-items-center">
                <Image
                  src={notification?.senderProfilePicture?.url}
                  alt="Sender Profile Picture"
                  width={50}
                  height={50}
                  roundedCircle
                  className="me-2"
                />
                <div>
                  <div>
                    <strong>{notification.senderName}</strong> {notification?.message}{" "}
                    {notification.date ? notification.date.toDate().toLocaleString() : ""}
                  </div>
                  <div className="mt-2">
                    <Button variant="primary" className="me-2" onClick={(e) => handleConfirm(e, notification?.senderId, notification?.senderName, notification?.senderProfilePicture?.url)}>
                      Confirm
                    </Button>
                    <Button variant="light" className="bg-gray me-2" onClick={(e) => handleDelete(e, notification?.senderId)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
  
};

export default Notifications;
