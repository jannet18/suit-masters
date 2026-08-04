import { Order, columns } from "./columns";
import { DataTable } from "../products/data-table";
import { adminApi, AdminOrder } from "../../lib/api-client";

const getData = async (): Promise<Order[]> => {
  try {
    const result = await adminApi.getOrders();
    if (result.success && result.orders.length > 0) {
      return result.orders.map((o: AdminOrder) => ({
        id: o.id,
        customerName: o.customerName || "N/A",
        customerEmail: o.customerEmail || "N/A",
        total: o.total,
        status: o.status,
        orderedItems: o.orderedItems || 0,
        createdAt: o.createdAt,
        estimatedDeliveryDate: o.estimatedDeliveryDate,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  return [];
};

const OrdersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Orders</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default OrdersPage;
