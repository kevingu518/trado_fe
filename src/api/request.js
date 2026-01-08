import axios from 'axios';

// 創建 Axios instance
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 確保請求攜帶 Cookie（如果後端需要）
  withCredentials: true,
});

// 請求攔截器
request.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('access_token') || '';
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 響應攔截器
request.interceptors.response.use(
  (response) => {
    // response.data 才是後端的輸出格式。
    // response會有一層 axois 的包裝
    console.log({response});
    console.log('response.data',response.data);
    return response.data.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.data?.status || error.response?.status;
    const msg = error.response?.data?.msg || error.message;

    // 處理 401 錯誤
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 假設 Refresh Token 由後端從 HTTP-Only Cookie 自動處理
        const { data } = await axios.post(
          `${request.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true } // 確保攜帶 Cookie
        );

        const { access_token, refresh_token } = data;
        // 更新 Access Token 到 sessionStorage
        sessionStorage.setItem('access_token', access_token);
        // 如果後端返回新的 Refresh Token，假設它已自動更新到 Cookie
        // 若需要前端手動設置 Cookie，可在此處添加 setCookie 邏輯

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return request(originalRequest);
      } catch (refreshError) {
        // 清除 Access Token
        sessionStorage.removeItem('access_token');
        // Refresh Token 由後端管理，無需前端清除 Cookie
        window.location.href = '/login';
        return Promise.reject({
          status: refreshError.response?.data?.status || 401,
          msg: refreshError.response?.data?.msg || 'Failed to refresh token',
        });
      }
    }

    // 其他錯誤處理
    switch (status) {
      case 400:
        console.error(`Bad Request: ${msg}`);
        break;
      case 403:
        console.error(`Forbidden: ${msg}`);
        break;
      case 404:
        console.error(`Not Found: ${msg}`);
        break;
      case 429:
        console.error(`Too Many Requests: ${msg}`);
        break;
      case 500:
        console.error(`Server Error: ${msg}`);
        break;
      default:
        console.error(`Error: ${msg}`);
    }

    return Promise.reject({ status, msg });
  }
);

export default request;