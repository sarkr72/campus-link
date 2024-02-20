export default async function handler(req, res) {
    const session = await getSession(req)
   
    // Check if the user is authenticated
    if (!session) {
      res.status(401).json({
        error: 'User is not authenticated',
      })
      return
    }
   
    // Check if the user has the 'admin' role
    if (session.user.role !== 'admin') {
      res.status(401).json({
        error: 'Unauthorized access: User does not have admin privileges.',
      })
      return
    }
   
    // Proceed with the route for authorized users
    // ... implementation of the API Route
  }