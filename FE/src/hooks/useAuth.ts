import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout as logoutAction, updateUser as updateUserAction } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

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

  const updateUser = (updatedUser: User) => {
    dispatch(updateUserAction(updatedUser));
  };

  return {
    user,
    token,
    isAuthenticated,
    logout,
    updateUser,
    isStudent: user?.role === 'Student',
    isRecruiter: user?.role === 'Recruiter',
    isTnP: user?.role === 'TnP',
  };
};

