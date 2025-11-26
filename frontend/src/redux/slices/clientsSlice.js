import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { clientService } from '../../services/clientService'

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async () => {
    return await clientService.getAllClients()
  }
)

const clientsSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.clients = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default clientsSlice.reducer

