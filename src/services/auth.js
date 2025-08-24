import API from "./api";


export const postForgotEmail = async (email) => {
  try {
    const response = await API.post('/api/password/forgotpassword', { email });
    return response.data;
  } catch (error) {
    console.error('Error posting for the password', error);
    throw new Error(
      error.response?.data?.message || 'Failed to send email'
    );
  }
};

export const postResetPassword = async (token, newPassword, confirmNewPassword) => {
  try {
    const response = await API.post(`/api/password/resetpassword/${token}`, {
      newPassword,
      confirmNewPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to reset password'
    );
  }
};


export const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
  try {
    const response = await API.patch(`/api/password/changepassword`, {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to change password'
    );
  }
};






