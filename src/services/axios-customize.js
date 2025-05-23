import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

// Add a request interceptor
axiosInstance.interceptors.request.use(function (config) {
  if (typeof window !== 'undefined' && window && window.localStorage && window.localStorage.getItem('access_token')) {
    const token = window.localStorage.getItem('access_token');
    config.headers.Authorization = 'Bearer ' + token;

    // Log chi tiết request
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', {
      ...config.headers,
      Authorization: 'Bearer ' + token.substring(0, 20) + '...' // Log một phần token để debug
    });
    console.log('Request data:', config.data);

    // Log token để debug
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', {
          sub: payload.sub, // email của user
          role: payload.role,
          iat: new Date(payload.iat * 1000).toLocaleString(),
          exp: new Date(payload.exp * 1000).toLocaleString()
        });
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  } else {
    console.warn('No access token found in localStorage');
  }
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axiosInstance.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  if (response.data && response.data.data) {
    return response.data;
  }
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  if (error.response) {
    console.error('Response error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
  }
  return Promise.reject(error);
});

export default axiosInstance;
