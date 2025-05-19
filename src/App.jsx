import { useContext, useEffect, useState } from 'react'
import Header from './components/layout/header'
import Footer from './components/layout/footer'
import { Outlet } from 'react-router-dom'
import { getAccountAPI } from './services/api-service'
import { AuthContext } from './components/context/auth-context'
import { Spin } from 'antd'

// CSS cho Spin component
const spinStyle = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'rgba(255, 255, 255, 0.8)'
  }
};

function App() {
  const { setUser, setIsLoading, isLoading } = useContext(AuthContext);

  const getAccount = async () => {
    try {
      const response = await getAccountAPI();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching account:', error);
      // Nếu có lỗi 401 (token hết hạn), xóa token và reset user
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        setUser({
          id: '',
          fullName: '',
          email: '',
          role: '',
          avatar: '',
          phone: ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAccount();
  }, []);

  return (
    <Spin
      spinning={isLoading}
      tip="Loading..."
      size="large"
      wrapperClassName="custom-spin"
      style={spinStyle.container}
    >
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <Outlet />
        <Footer />
      </div>
    </Spin>
  )
}

export default App
