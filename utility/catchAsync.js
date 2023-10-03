const sendErrorResponse = (res, error) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ success: false, error: message });
  };
  
  const catchAsyncErrors = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch((error) => sendErrorResponse(res, error));
    };
  };
  
  const deleteUnactivatedUsers = async () => {
    try {
      const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
  
      const unactivatedUsers = await User.find({
        isActivated: false,
        createdAt: { $lt: twentyMinutesAgo },
      });
      if(!unactivatedUsers){
        return res.status(201).json({
          success:false,
          message:"No users to be deleted"
        })
      }
  
      for (const user of unactivatedUsers) {
        await user.remove();
        console.log(`Deleted unactivated user with email: ${user.email}`);
      }
    } catch (error) {
      console.error("Error deleting unactivated users:", error);
    }
  }; 
  module.exports = { sendErrorResponse, catchAsyncErrors,deleteUnactivatedUsers };
  