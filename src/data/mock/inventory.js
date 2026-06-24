export const STOCK_ENTRIES = [
  { id: 'se_1', stationId: 'st_1', supplierId: 'sup_1', supplierName: 'BalticOil Wholesale', productId: 'p_1', productName: 'Petrol 95', quantity: 12000, purchasePrice: 1.34, invoiceNumber: 'PO-5521', date: '2026-06-20' },
  { id: 'se_2', stationId: 'st_1', supplierId: 'sup_1', supplierName: 'BalticOil Wholesale', productId: 'p_3', productName: 'Diesel', quantity: 10000, purchasePrice: 1.28, invoiceNumber: 'PO-5522', date: '2026-06-20' },
  { id: 'se_3', stationId: 'st_2', supplierId: 'sup_2', supplierName: 'NordFuel Supply', productId: 'p_1', productName: 'Petrol 95', quantity: 18000, purchasePrice: 1.32, invoiceNumber: 'PO-5530', date: '2026-06-18' },
  { id: 'se_4', stationId: 'st_2', supplierId: 'sup_3', supplierName: 'EuroGas Partners', productId: 'p_5', productName: 'CNG', quantity: 6000, purchasePrice: 0.88, invoiceNumber: 'PO-5535', date: '2026-06-15' },
  { id: 'se_5', stationId: 'st_3', supplierId: 'sup_4', supplierName: 'PetroLink Distribution', productId: 'p_2', productName: 'Petrol 98', quantity: 8000, purchasePrice: 1.46, invoiceNumber: 'PO-5540', date: '2026-06-12' }
];

export const TRANSFER_STATUS = {
  pending: { label: 'Pending', cls: 'status-yellow' },
  in_transit: { label: 'In transit', cls: 'status-blue' },
  completed: { label: 'Completed', cls: 'status-green' }
};

export const STOCK_TRANSFERS = [
  { id: 'tr_1', fromStationId: 'st_1', fromStationName: 'Riverside Fuel Center', toStationId: 'st_3', toStationName: 'Old Town Petrol', productId: 'p_1', productName: 'Petrol 95', quantity: 5000, status: 'in_transit', notes: 'Cover low stock', date: '2026-06-22' },
  { id: 'tr_2', fromStationId: 'st_2', fromStationName: 'Highway 7 Station', toStationId: 'st_4', toStationName: 'Seaside Express', productId: 'p_3', productName: 'Diesel', quantity: 3000, status: 'pending', notes: 'Weekend demand', date: '2026-06-23' },
  { id: 'tr_3', fromStationId: 'st_1', fromStationName: 'Riverside Fuel Center', toStationId: 'st_2', toStationName: 'Highway 7 Station', productId: 'p_2', productName: 'Petrol 98', quantity: 2000, status: 'completed', notes: '', date: '2026-06-19' }
];
