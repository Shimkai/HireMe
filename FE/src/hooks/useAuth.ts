import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout as logoutAction } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    logout,
    isStudent: user?.role === 'Student',
    isRecruiter: user?.role === 'Recruiter',
    isTnP: user?.role === 'TnP',
  };
};

