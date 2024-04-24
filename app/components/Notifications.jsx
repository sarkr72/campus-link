import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase"; // Assuming db is your Firestore database instance
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ListGroup, Image, Button } from "react-bootstrap";
import { FiMoreVertical } from "react-icons/fi";
import { Modal } from "react-bootstrap";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import ViewPost from "./ViewPost";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [retrivedRequests, setRetrivedRequests] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [viewCommentsModalShow, setViewCommentsModalShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState("");


  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        setUser(userDoc?.data());
        setRetrivedRequests(userDoc?.data()?.friendRequests);
        console.log("notification");
      }
    });
  }, []);

  const handleConfirm = async (e, id, name, profilePicture) => {
    console.log("here");
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
          profilePicture: profilePicture || null,
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

  const handleDeleteNotification = async () => {
    if (notificationToDelete) {
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const updatedNotifications = userData?.notifications?.filter(
        (n) =>
          !(
            n.message === notificationToDelete.message &&
            n.senderId === notificationToDelete.senderId
          )
      );

      await updateDoc(userRef, { notifications: updatedNotifications });
      const userRef2 = doc(db, "users", user.id);
      const userDoc2 = await getDoc(userRef2);
      const userData2 = userDoc2.data();
      setUser(userData2);

      setShowConfirmation(false);
      setNotificationToDelete(null);
    }
  };

  const handlePostShow = async (postId) => {
    console.log("iddd", postId);
    const userRef = doc(db, "posts", postId);
    const userDoc = await getDoc(userRef);
    setSelectedPost(userDoc?.data());
    // selectedPost = userDoc?.data();
    console.log("post1", selectedPost);
    setShowAllComments(true);
    setViewCommentsModalShow(true);
  };

  const handleCloseViewCommentsModal = () => {
    setViewCommentsModalShow(false);
    setSelectedPost(null);
    // setSelectedPostComments([]);
  };
 
  return (
    <div>
      {user && user?.notifications && (
        <>
          <ListGroup>
            {user?.notifications.map((notification, index) => (
              <ListGroup.Item
                key={index}
                
                
              >
                <div className="d-flex align-items-center">
                  <Image
                    src={notification?.senderProfilePicture?.url}
                    alt="Sender Profile Picture"
                    width={50}
                    height={50}
                    roundedCircle
                    className="me-2"
                  />
                  <div onClick={
                  notification.postId &&
                  (() => handlePostShow(notification.postId)) 
                }
                style={{ cursor: notification.postId ? "pointer" : "default" }}>
                    <div>
                      <strong>{notification.senderName}</strong>{" "}
                      {notification?.message}{" "}
                      {notification.date
                        ? notification.date.toDate().toLocaleString()
                        : ""}
                    </div>
                    {retrivedRequests?.map((request, index) => {
                      const [, requestId] = request.split(",");
                      if (
                        requestId === notification?.senderId &&
                        !notification.message.includes("following") && !notification?.message?.includes("commented") && !notification?.message?.includes("liked")
                      ) {
                        return (
                          <div className="mt-2" key={index}>
                            <Button
                              variant="primary"
                              className="me-2"
                              onClick={(e) =>
                                handleConfirm(
                                  e,
                                  notification?.senderId,
                                  notification?.senderName,
                                  notification?.senderProfilePicture?.url
                                )
                              }
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="light"
                              className="bg-gray me-2"
                              onClick={(e) =>
                                handleDelete(e, notification?.senderId)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <FiMoreVertical
                    onClick={() => {
                      setShowConfirmation(true);
                      setNotificationToDelete(notification);
                    }}
                    style={{ width: "20px",  cursor:  "pointer" }}
                  />
                  <Modal
                    show={showConfirmation}
                    onHide={() => setShowConfirmation(false)}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{fontWeight: "bold"}}>Remove this notification?</span>
                        <div>
                          <Button
                            variant="secondary"
                            onClick={() => setShowConfirmation(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleDeleteNotification}
                            style={{ marginLeft: "10px" }}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          {viewCommentsModalShow && showAllComments && selectedPost && (
            <>
              {console.log("asasdsd", selectedPost)}
              <ViewPost
                viewCommentsModalShow={viewCommentsModalShow}
                handleCloseViewCommentsModal={handleCloseViewCommentsModal}
                selectedPost={selectedPost}
                userRole={user?.role}
                imageUrl={user?.profilePicture?.url}
                // setComment={setComment}
                // handlePostComment={handlePostComment}
                // comment={comment}
                // handleLikePost={handleLikePost}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
