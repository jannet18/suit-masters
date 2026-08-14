import CardList, { type CardListItem } from "./components/CardList";
import AppBarChart, { type RevenuePoint } from "./components/AppBarChart";
import AppPieChart, { type StatusPoint } from "./components/AppPieChart";
import TodoList from "./components/TodoList";
import AppAreaChart, { type CustomerPoint } from "./components/AppAreaChart";
import { adminApi } from "../lib/api-client";

function newCustomersByMonth(users: { created_at?: string }[]): CustomerPoint[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }

  const counts = new Map(months.map((m) => [m.key, 0]));
  for (const u of users) {
    if (!u.created_at) continue;
    const d = new Date(u.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }

  return months.map((m) => ({ month: m.label, count: counts.get(m.key) || 0 }));
}

export default async function Home() {
  const [statsResult, productsResult, usersResult] = await Promise.all([
    adminApi.getOrderStats(),
    adminApi.getProducts(),
    adminApi.getUsers(),
  ]);

  const revenueByMonth: RevenuePoint[] = (statsResult.revenueByMonth || []) as RevenuePoint[];
  const ordersByStatus: StatusPoint[] = (statsResult.ordersByStatus || []) as StatusPoint[];
  const recentOrders = statsResult.recentOrders || [];

  const recentTransactionItems: CardListItem[] = recentOrders.map((o) => ({
    id: o.id,
    title: `Order #${o.id}`,
    subtitle: o.customerName,
    value: `$${Number(o.total).toFixed(2)}`,
  }));

  const productItems: CardListItem[] = (productsResult.products || [])
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      title: p.name,
      value: `$${Number(p.base_price).toFixed(2)}`,
      image: p.product_image?.default,
    }));

  const customerPoints = newCustomersByMonth(usersResult.users || []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppBarChart data={revenueByMonth} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Latest Orders" items={recentTransactionItems} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <AppPieChart data={ordersByStatus} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <TodoList />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart data={customerPoints} />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Products" items={productItems} />
      </div>
    </div>
  );
}
