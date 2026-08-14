import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { adminApi, AdminPayment } from "../../lib/api-client";

const getData = async (): Promise<Payment[]> => {
  try {
    const result = await adminApi.getPayments();
    if (result.success && result.payments.length > 0) {
      return result.payments.map((p: AdminPayment) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        fullName: p.fullName,
        email: p.email,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch payments:", error);
  }

  return [];
};

const PaymentsPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Payments</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default PaymentsPage;
