import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { salesOrderService } from '../../services/salesOrderService'

export const fetchSalesOrders = createAsyncThunk(
  'salesOrders/fetchSalesOrders',
  async () => {
    return await salesOrderService.getAllSalesOrders()
  }
)

export const fetchSalesOrderById = createAsyncThunk(
  'salesOrders/fetchSalesOrderById',
  async (id) => {
    return await salesOrderService.getSalesOrderById(id)
  }
)

export const createSalesOrder = createAsyncThunk(
  'salesOrders/createSalesOrder',
  async (orderData) => {
    return await salesOrderService.createSalesOrder(orderData)
  }
)

export const updateSalesOrder = createAsyncThunk(
  'salesOrders/updateSalesOrder',
  async ({ id, orderData }) => {
    return await salesOrderService.updateSalesOrder(id, orderData)
  }
)

const salesOrdersSlice = createSlice({
  name: 'salesOrders',
  initialState: {
    salesOrders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSalesOrders.fulfilled, (state, action) => {
        state.loading = false
        state.salesOrders = action.payload
      })
      .addCase(fetchSalesOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchSalesOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSalesOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchSalesOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createSalesOrder.fulfilled, (state, action) => {
        state.salesOrders.unshift(action.payload)
      })
      .addCase(updateSalesOrder.fulfilled, (state, action) => {
        const index = state.salesOrders.findIndex(
          (so) => so.id === action.payload.id
        )
        if (index !== -1) {
          state.salesOrders[index] = action.payload
        }
      })
  },
})

export const { clearCurrentOrder } = salesOrdersSlice.actions
export default salesOrdersSlice.reducer

