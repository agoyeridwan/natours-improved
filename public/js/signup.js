import axios from 'axios';
import { showAlert } from './alerts';
export const signup = async (email, password, passwordConfirm, name) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signup',
      data: {
        email,
        password,
        passwordConfirm,
        name,
      },
    });
    if (res.data.status === 'Success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    // console.log(email, password, passwordConfirm);
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
// 'http://localhost:3000/api/v1/users/signup'
