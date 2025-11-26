import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClients } from '../redux/slices/clientsSlice'
import { fetchItems } from '../redux/slices/itemsSlice'
import {
  fetchSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  clearCurrentOrder,
} from '../redux/slices/salesOrdersSlice'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import HeaderActions from '../components/HeaderActions'


const SalesOrder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEditMode = !!id

  const { clients } = useSelector((state) => state.clients)
  const { items } = useSelector((state) => state.items)
  const { currentOrder, loading } = useSelector((state) => state.salesOrders)

  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    invoiceDate: '',
    referenceNumber: '',
    notes: '',
    address1: '',
    address2: '',
    address3: '',
    state: '',
    postCode: '',
    items: [],
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    dispatch(fetchClients())
    dispatch(fetchItems())

    if (isEditMode) {
      dispatch(fetchSalesOrderById(parseInt(id)))
    }

    return () => {
      dispatch(clearCurrentOrder())
    }
  }, [dispatch, id, isEditMode])

  useEffect(() => {
    if (isEditMode && currentOrder) {
      setFormData({
        clientId: currentOrder.clientId.toString(),
        invoiceNumber: currentOrder.invoiceNumber || '',
        invoiceDate: currentOrder.invoiceDate ? new Date(currentOrder.invoiceDate).toISOString().split('T')[0] : '',
        referenceNumber: currentOrder.referenceNumber || '',
        notes: currentOrder.notes || '',
        address1: currentOrder.address1 || '',
        address2: currentOrder.address2 || '',
        address3: currentOrder.address3 || '',
        state: currentOrder.state || '',
        postCode: currentOrder.postCode || '',
        items: currentOrder.items.map((item) => ({
          id: item.id,
          itemId: item.itemId.toString(),
          note: item.note,
          quantity: item.quantity.toString(),
          taxRate: item.taxRate.toString(),
          exclAmount: item.exclAmount,
          taxAmount: item.taxAmount,
          inclAmount: item.inclAmount,
        })),
      })
    }
  }, [currentOrder, isEditMode])

  const handleClientChange = (e) => {
    const clientId = e.target.value
    const client = clients.find((c) => c.id.toString() === clientId)

    setFormData({
      ...formData,
      clientId,
      address1: client?.address1 || '',
      address2: client?.address2 || '',
      address3: client?.address3 || '',
      state: client?.state || '',
      postCode: client?.postCode || '',
    })
  }

  const handleFieldChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemId: '',
          note: '',
          quantity: '',
          taxRate: '',
          exclAmount: 0,
          taxAmount: 0,
          inclAmount: 0,
        },
      ],
    })
  }

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Get the current item for calculations
    const currentItemId = field === 'itemId' ? value : updatedItems[index].itemId
    const item = items.find((i) => i.id.toString() === currentItemId)

    // If itemId changed, store the item price
    if (field === 'itemId' && item) {
      updatedItems[index].itemPrice = item.price
    }

    // Calculate amounts if we have item, quantity, and taxRate
    if (item) {
      const quantity = parseFloat(updatedItems[index].quantity) || 0
      const taxRate = parseFloat(updatedItems[index].taxRate) || 0
      
      if (quantity > 0) {
        const exclAmount = quantity * item.price
        const taxAmount = (exclAmount * taxRate) / 100
        const inclAmount = exclAmount + taxAmount

        updatedItems[index].exclAmount = exclAmount
        updatedItems[index].taxAmount = taxAmount
        updatedItems[index].inclAmount = inclAmount
      } else {
        // Reset amounts if quantity is 0 or empty
        updatedItems[index].exclAmount = 0
        updatedItems[index].taxAmount = 0
        updatedItems[index].inclAmount = 0
      }
    }

    setFormData({
      ...formData,
      items: updatedItems,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client'
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Please add at least one item'
    }

    formData.items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`item_${index}_itemId`] = 'Please select an item'
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Please enter a valid quantity'
      }
      if (!item.taxRate || parseFloat(item.taxRate) < 0) {
        newErrors[`item_${index}_taxRate`] = 'Please enter a valid tax rate'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    const orderData = {
      clientId: parseInt(formData.clientId),
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate) : null,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
      address1: formData.address1,
      address2: formData.address2,
      address3: formData.address3,
      state: formData.state,
      postCode: formData.postCode,
      items: formData.items.map((item) => ({
        itemId: parseInt(item.itemId),
        note: item.note,
        quantity: parseFloat(item.quantity),
        taxRate: parseFloat(item.taxRate),
      })),
    }

    try {
      if (isEditMode) {
        await dispatch(updateSalesOrder({ id: parseInt(id), orderData })).unwrap()
      } else {
        await dispatch(createSalesOrder(orderData)).unwrap()
      }
      navigate('/')
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Failed to save order. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCancel = () => {
    navigate('/')
  }

  const getTotalAmounts = () => {
    return formData.items.reduce(
      (totals, item) => ({
        excl: totals.excl + (item.exclAmount || 0),
        tax: totals.tax + (item.taxAmount || 0),
        incl: totals.incl + (item.inclAmount || 0),
      }),
      { excl: 0, tax: 0, incl: 0 }
    )
  }

  const totals = getTotalAmounts()

  if (loading && isEditMode) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  return (

    
    <div className="container px-4 py-8 mx-auto print:px-0 print:py-0">
      <div className="container relative flex items-center justify-center mx-auto bg-gray-50">
              
              <HeaderActions 
                onAdd={() => console.log("Add row")} 
                onRemove={() => console.log("Remove row")} 
                onClose={() => window.location.href = "/"}
                title="Sales Order" 
              />
          
            </div>
      <div className="p-6 bg-white rounded-lg shadow-md print:shadow-none">
        
        
        <div className="flex items-center justify-between mb-6 print:hidden">
          
          <Button onClick={handleSave} variant="primary" className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Order
          </Button>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-gray-800">Sales Order</h1>

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Left Column - Customer Information */}
          <div>
            <Select
              label="Customer Name"
              id="clientId"
              value={formData.clientId}
              onChange={handleClientChange}
              options={clients.map((client) => ({
                value: client.id.toString(),
                label: client.name,
              }))}
              required
            />
            <Input
              label="Address 1"
              id="address1"
              value={formData.address1}
              onChange={(e) => handleFieldChange('address1', e.target.value)}
              placeholder="Enter address 1"
            />
            <Input
              label="Address 2"
              id="address2"
              value={formData.address2}
              onChange={(e) => handleFieldChange('address2', e.target.value)}
              placeholder="Enter address 2"
            />
            <Input
              label="Address 3"
              id="address3"
              value={formData.address3}
              onChange={(e) => handleFieldChange('address3', e.target.value)}
              placeholder="Enter address 3"
            />
            <Input
              label="State"
              id="state"
              value={formData.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              placeholder="Enter state"
            />
            <Input
              label="Post Code"
              id="postCode"
              value={formData.postCode}
              onChange={(e) => handleFieldChange('postCode', e.target.value)}
              placeholder="Enter post code"
            />
          </div>

          {/* Right Column - Invoice Information */}
          <div>
            <Input
              label="Invoice No."
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
              placeholder="Enter invoice number"
            />
            <Input
              label="Invoice Date"
              id="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
            />
            <Input
              label="Reference no"
              id="referenceNumber"
              value={formData.referenceNumber}
              onChange={(e) => handleFieldChange('referenceNumber', e.target.value)}
              placeholder="Enter reference number"
            />
            <div className="mb-4">
              <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Enter notes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
            <Button onClick={handleAddItem} variant="primary" className="print:hidden">
              Add Item
            </Button>
          </div>

          {errors.items && (
            <div className="mb-2 text-sm text-red-600">{errors.items}</div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Item Code
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Note
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Tax
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Excl Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Tax Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Incl Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase print:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No items added. Click "Add Item" to add items to this order.
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, index) => {
                    const selectedItem = items.find(
                      (i) => i.id.toString() === item.itemId
                    )

                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={item.itemId}
                            onChange={(e) =>
                              handleItemChange(index, 'itemId', e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select Code</option>
                            {items.map((i) => (
                              <option key={i.id} value={i.id.toString()}>
                                {i.code}
                              </option>
                            ))}
                          </select>
                          {errors[`item_${index}_itemId`] && (
                            <div className="mt-1 text-xs text-red-600">
                              {errors[`item_${index}_itemId`]}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={item.itemId}
                            onChange={(e) =>
                              handleItemChange(index, 'itemId', e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select Description</option>
                            {items.map((i) => (
                              <option key={i.id} value={i.id.toString()}>
                                {i.description}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.note}
                            onChange={(e) =>
                              handleItemChange(index, 'note', e.target.value)
                            }
                            placeholder="Note"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', e.target.value)
                            }
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors[`item_${index}_quantity`] && (
                            <div className="mt-1 text-xs text-red-600">
                              {errors[`item_${index}_quantity`]}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          ${selectedItem?.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) =>
                              handleItemChange(index, 'taxRate', e.target.value)
                            }
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors[`item_${index}_taxRate`] && (
                            <div className="mt-1 text-xs text-red-600">
                              {errors[`item_${index}_taxRate`]}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          ${item.exclAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          ${item.taxAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          ${item.inclAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap print:hidden">
                          <Button
                            onClick={() => handleRemoveItem(index)}
                            variant="danger"
                            className="px-2 py-1 text-xs"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                    Totals:
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${totals.excl.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${totals.tax.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${totals.incl.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesOrder

