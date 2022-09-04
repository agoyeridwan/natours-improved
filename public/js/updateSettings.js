import axios from 'axios';
import { showAlert } from './alerts';
// type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(res);
    if (res.data.status === 'sucess' || res.data.status === 'Success')
      showAlert('success', `${type.toUpperCase()} updated successfully`);
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
