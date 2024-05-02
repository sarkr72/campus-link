export async function fetchUserData(profile) {
    try {
      // Simulate fetching user data using the provided user object
      const userData = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        profilePicture: profile.profilePicture,
        bio: profile.bio,
        major: profile.major,
        minor: profile.minor,
        isTutor: profile.isTutor,
        role: profile.role,
      };
  
      // Return the fetched user data
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      return null;
    }
  }
  