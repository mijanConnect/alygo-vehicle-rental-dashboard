import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  globalSearch: string
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  globalSearch: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload
    },
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload
    },
  },
})

export const { toggleSidebar, setMobileSidebarOpen, setGlobalSearch } = uiSlice.actions
export default uiSlice.reducer
