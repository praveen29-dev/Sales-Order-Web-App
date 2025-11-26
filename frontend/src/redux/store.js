import { configureStore } from '@reduxjs/toolkit'
import clientsSlice from './slices/clientsSlice'
import itemsSlice from './slices/itemsSlice'
import salesOrdersSlice from './slices/salesOrdersSlice'

export const store = configureStore({
  reducer: {
    clients: clientsSlice,
    items: itemsSlice,
    salesOrders: salesOrdersSlice,
  },
})

