import Image from "next/image";
import Hero from "./components/Hero";
import FeaturedCollections from "./components/FeaturedCollections";
import CustomizationSection from "./components/CustomizationSection";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
export default function Home() {
  const { user, getToken } = useKindeAuth();

  const fetchOrders = async () => {
    const token = await getToken();
    const response = await fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const orders = await response.json();
    return (
      <div className="">
        <div>
          <h1>Welcome {user?.given_name}</h1>
          <button onClick={fetchOrders}>Fetch my orders</button>
        </div>
        <Hero />
        <FeaturedCollections />
        <CustomizationSection />
      </div>
    );
  };
}
