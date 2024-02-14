import React from 'react';
import { Auth } from 'aws-amplify';
import { RiGoogleFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import awsconfig from '../../aws-exports';
Auth.configure(awsconfig);

const OAuth = () => {
  const navigate = useNavigate();

  const onGoogleClick = async () => {
    try {
      const user = await Auth.federatedSignIn({ provider: 'Google' });

      // Check if user is already in database (server-side)
      // Call your backend API to handle this logic

      navigate('/');
    } catch (error) {
      toast.error('Could not authorize with Google.');
    }
  };

  return (
    <button
      type="button"
      onClick={onGoogleClick}
      className="flex items-center justify-center w-full bg-gray-600 text-white px-7 py-3 uppercase text-sm font-medium hover:bg-gray-700 active:bg-gray-800 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded"
    >
      <RiGoogleFill className="text-gray-500 text-2xl bg-white rounded-full mr-2" />
      Continue with Google
    </button>
  );
};

export default OAuth;
