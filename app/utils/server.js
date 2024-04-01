


// import AWS from "aws-sdk";
// import awsmobile from "../aws-exports";
// import React, { useState, useEffect } from "react";

// AWS.config.update({
//   accessKeyId: process.env.NEXT_PUBLIC_accessKeyId,
//   secretAccessKey: process.env.NEXT_PUBLIC_secretAccessKey,
//   region: process.env.NEXT_PUBLIC_region2,
// });


// const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();


// export const listUsers = async () => {
//   try {
//     const params = {
//       UserPoolId: process.env.NEXT_PUBLIC_aws_user_pools_id,
//     };

//     let data2 = [];
//     await new Promise((resolve, reject) => {
//       cognitoIdentityServiceProvider.listUsers(params, function (err, data) {
//         if (err) {
//           console.error("Error:", err);
//           reject(err);
//         } else {
//           data.Users.forEach((user) => {
//             const firstAttribute = user.Attributes[0]; // Get the first attribute
//             if (firstAttribute) {
//                 data2.push({ Name: firstAttribute.Name, Value: firstAttribute.Value });
//             }
//         });
//           resolve(data2);
//         }
//       });
//     });

//     return data2;
//   } catch (error) {
//     console.error("Error listing users:", error);
//     throw error;
//   }
// };

// export const getCurrentUserEmail = async () => {
//   try {
//     const params = {
//       UserPoolId: process.env.NEXT_PUBLIC_aws_user_pools_id,
//     };

//     const data = await new Promise((resolve, reject) => {
//       cognitoIdentityServiceProvider.listUsers(params, function (err, data) {
//         if (err) {
//           console.error("Error:", err);
//           reject(err);
//         } else {
//           resolve(data);
//         }
//       });
//     });

//     let currentUserEmail = null;
//     data.Users.forEach((user) => {
//       const emailAttribute = user.Attributes.find(attr => attr.Name === 'email');
//       if (emailAttribute) {
//         currentUserEmail = emailAttribute.Value;
//       }
//     });

//     return currentUserEmail;
//   } catch (error) {
//     console.error("Error getting current user email:", error);
//     throw error;
//   }
// };



// export const deleteUser = async (username) => {
//   console.log('deleted called', username)
//   try {
//     const params = {
//       UserPoolId: process.env.NEXT_PUBLIC_aws_user_pools_id,
//       Username: username,
//     };
//     await cognitoIdentityServiceProvider.adminDeleteUser(params).promise();
//     console.log("User deleted successfully");
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     throw error;
//   }
// };


