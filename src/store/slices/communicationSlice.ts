import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Trip } from '@/types'

interface CommunicationUiState {
  tripDrawerOpen: boolean
  activeTrip: Trip | null
  activeConversationId: string | null
  commDrawerTab: 'both' | 'driver' | 'passenger' | 'timeline' | 'safety'
}

const initialState: CommunicationUiState = {
  tripDrawerOpen: false,
  activeTrip: null,
  activeConversationId: null,
  commDrawerTab: 'both',
}

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    openTripCommunicationDrawer: (
      state,
      action: PayloadAction<{ trip: Trip; tab?: CommunicationUiState['commDrawerTab']; conversationId?: string }>,
    ) => {
      state.tripDrawerOpen = true
      state.activeTrip = action.payload.trip
      state.commDrawerTab = action.payload.tab ?? 'both'
      state.activeConversationId = action.payload.conversationId ?? null
    },
    closeTripCommunicationDrawer: (state) => {
      state.tripDrawerOpen = false
      state.activeTrip = null
      state.activeConversationId = null
    },
    setCommDrawerTab: (state, action: PayloadAction<CommunicationUiState['commDrawerTab']>) => {
      state.commDrawerTab = action.payload
    },
  },
})

export const { openTripCommunicationDrawer, closeTripCommunicationDrawer, setCommDrawerTab } =
  communicationSlice.actions
export default communicationSlice.reducer
