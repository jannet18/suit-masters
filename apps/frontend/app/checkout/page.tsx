import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/checkout");
  }

  return (
    <div className="max-w-4xl mx-auto py-24">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {/* checkout form */}
    </div>
  );
}
