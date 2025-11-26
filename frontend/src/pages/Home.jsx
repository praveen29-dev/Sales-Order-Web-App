import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSalesOrders } from '../redux/slices/salesOrdersSlice'
import Button from '../components/Button'
import HeaderActions from '../components/HeaderActions'

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { salesOrders, loading, error } = useSelector((state) => state.salesOrders)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  useEffect(() => {
    dispatch(fetchSalesOrders())
  }, [dispatch])

  const handleAddNew = () => {
    navigate('/sales-order')
  }

  const handleRowDoubleClick = (orderId) => {
    navigate(`/sales-order/${orderId}`)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    if (!sortConfig.key) return salesOrders

    return [...salesOrders].sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (sortConfig.key === 'orderDate') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const sortedOrders = getSortedData()

  return (

    <div className="container min-h-screen px-4 py-4 mx-auto bg-gray-50">
      <nav className="px-4 py-3 mb-4 bg-gray-50">
        <div className="container relative flex items-center justify-center mx-auto">
    
    <HeaderActions 
      onAdd={() => console.log("Add row")} 
      onRemove={() => console.log("Remove row")} 
      onClose={() => window.location.href = "/"}
      title="Home" 
    />

  </div>
      </nav>

      <div className="container px-4 py-4 mx-auto">
          <Button onClick={handleAddNew} variant="primary">
            Add New
          </Button>
      </div>    

      <div className="container px-4 py-8 mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">

        {loading && (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 mb-4 text-red-700 border border-red-200 rounded bg-red-50">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orderNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Order Number
                      <span className="text-gray-400">▼</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('clientName')}
                  >
                    <div className="flex items-center gap-1">
                      Client Name
                      <span className="text-gray-400">▼</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center gap-1">
                      Order Date
                      <span className="text-gray-400">▼</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Items Count
                      <span className="text-gray-400">▼</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalInclAmount')}
                  >
                    <div className="flex items-center gap-1">
                      Total Amount
                      <span className="text-gray-400">▼</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <span className="text-gray-400">▼</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No sales orders found. Click "Add New" to create your first order.
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => (
                    <tr
                      key={order.id}
                      onDoubleClick={() => handleRowDoubleClick(order.id)}
                      className="transition-colors cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {order.clientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(order.totalInclAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default Home

