import axios from 'axios';
import router from './../router/index';
import { useRouter } from 'vue-router';


// export const baseURL2 = 'https://tmb-api.dynamiis.app/api/v1';
// export const baseURL = 'https://tmb-api.dynamiis.app/api/v1';
// export const styleURL = 'https://tmb-api.dynamiis.app/api/v1';
// export const storageURL = 'https://tmb-api.dynamiis.app/uploads/products/';

// export const baseURL2 = 'http://3.145.1.182:4000/api/v1';
// export const baseURL = 'http://3.145.1.182:4000/api/v1';
// export const styleURL = 'http://3.145.1.182:4000/api/v1';
// export const storageURL = 'http://3.145.1.182:4000/uploads/products/';

export const baseURL2 = 'http://localhost:3000/api/v1';
export const baseURL = 'http://localhost:3000/api/v1';
export const styleURL = 'http://localhost:3000/api/v1';
export const storageURL = 'http://localhost:3000/uploads/products/';


export function logout() {
    axios.post(`${baseURL}/logout`).then((response) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
    });
}