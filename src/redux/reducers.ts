import authReducer from '@/redux/slice/authSlice'
import communicationReducer from '@/store/slices/communicationSlice'
import uiReducer from '@/store/slices/uiSlice'

/** Non-RTK Query slice reducers */
export const reducers = {
  auth: authReducer,
  ui: uiReducer,
  communication: communicationReducer,
}
