"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

interface Order {
  id: number;
  total: string;
  status: string;
  orderedItems: number;
  createdAt: string;
  estimatedDeliveryDate?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
}

interface MeasurementProfile {
  id: string;
  profileName: string;
  unit: "cm" | "in";
  height: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
  shoulder: string;
  isDefault: boolean;
  createdAt: string;
}

const MEASUREMENT_FIELDS: { key: keyof Omit<MeasurementProfile, "id" | "profileName" | "unit" | "isDefault" | "createdAt">; label: string }[] = [
  { key: "height", label: "Height" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "inseam", label: "Inseam" },
  { key: "shoulder", label: "Shoulder Width" },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "measurements" | "profile"
  >("overview");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Measurement profile state
  const [measurementProfiles, setMeasurementProfiles] = useState<MeasurementProfile[]>([]);
  const [measLoading, setMeasLoading] = useState(false);
  const [showMeasForm, setShowMeasForm] = useState(false);
  const [editingMeasId, setEditingMeasId] = useState<string | null>(null);
  const [measForm, setMeasForm] = useState({
    profileName: "",
    unit: "cm" as "cm" | "in",
    height: "",
    chest: "",
    waist: "",
    hips: "",
    inseam: "",
    shoulder: "",
    isDefault: false,
  });
  const [measSaving, setMeasSaving] = useState(false);
  const [measMessage, setMeasMessage] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (!userData) {
        router.replace(`/api/auth/login?redirect=/account`);
      } else {
        setUser(userData);
        setProfileName(userData.name || "");
        setProfilePhone(userData.phone || "");
        setProfileAddress(userData.address || "");
        fetchOrders();
      }
    });
  }, [router]);

  // Fetch measurement profiles when the measurements tab is activated
  useEffect(() => {
    if (activeTab === "measurements") {
      fetchMeasurementProfiles();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          address: profileAddress,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state optimistically
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: profileName,
                phone: profilePhone,
                address: profileAddress,
              }
            : prev,
        );
        setSaveMessage("Profile updated successfully");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(data.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      setSaveMessage("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // --- Measurement Profile CRUD ---
  const fetchMeasurementProfiles = async () => {
    setMeasLoading(true);
    try {
      const res = await fetch("/api/measurements", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMeasurementProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error("Failed to fetch measurement profiles", error);
    } finally {
      setMeasLoading(false);
    }
  };

  const resetMeasForm = () => {
    setMeasForm({
      profileName: "",
      unit: "cm",
      height: "",
      chest: "",
      waist: "",
      hips: "",
      inseam: "",
      shoulder: "",
      isDefault: false,
    });
    setEditingMeasId(null);
    setMeasMessage(null);
  };

  const openNewMeasForm = () => {
    resetMeasForm();
    setShowMeasForm(true);
  };

  const openEditMeasForm = (profile: MeasurementProfile) => {
    setMeasForm({
      profileName: profile.profileName,
      unit: profile.unit,
      height: profile.height,
      chest: profile.chest,
      waist: profile.waist,
      hips: profile.hips,
      inseam: profile.inseam,
      shoulder: profile.shoulder,
      isDefault: profile.isDefault,
    });
    setEditingMeasId(profile.id);
    setShowMeasForm(true);
    setMeasMessage(null);
  };

  const handleSaveMeasurement = async () => {
    if (!measForm.profileName.trim()) {
      setMeasMessage("Please enter a profile name");
      return;
    }

    setMeasSaving(true);
    setMeasMessage(null);

    try {
      const payload = {
        ...measForm,
        height: parseFloat(measForm.height) || 0,
        chest: parseFloat(measForm.chest) || 0,
        waist: parseFloat(measForm.waist) || 0,
        hips: parseFloat(measForm.hips) || 0,
        inseam: parseFloat(measForm.inseam) || 0,
        shoulder: parseFloat(measForm.shoulder) || 0,
      };

      let res: Response;

      if (editingMeasId) {
        // Update existing profile
        res = await fetch(`/api/measurements?id=${editingMeasId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        // Create new profile
        res = await fetch("/api/measurements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (data.success) {
        setMeasMessage(
          editingMeasId
            ? "Measurement profile updated successfully"
            : "Measurement profile created successfully",
        );
        setShowMeasForm(false);
        resetMeasForm();
        // Refresh the list
        fetchMeasurementProfiles();
      } else {
        setMeasMessage(data.error || "Failed to save measurement profile");
      }
    } catch (error) {
      console.error("Failed to save measurement profile", error);
      setMeasMessage("Failed to save measurement profile");
    } finally {
      setMeasSaving(false);
    }
  };

  const handleDeleteMeasurement = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this measurement profile?")) {
      return;
    }

    try {
      const res = await fetch(`/api/measurements?id=${profileId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMeasurementProfiles((prev) =>
          prev.filter((p) => p.id !== profileId),
        );
        if (editingMeasId === profileId) {
          resetMeasForm();
          setShowMeasForm(false);
        }
      } else {
        console.error("Failed to delete profile:", data.error);
      }
    } catch (error) {
      console.error("Failed to delete measurement profile", error);
    }
  };

  const handleSetDefaultMeasurement = async (profileId: string) => {
    try {
      const res = await fetch(`/api/measurements?id=${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isDefault: true }),
      });

      const data = await res.json();

      if (data.success) {
        fetchMeasurementProfiles();
      }
    } catch (error) {
      console.error("Failed to set default measurement", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a96e] mx-auto"></div>
          <p className="mt-4">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb]">
      {/* Header */}
      <header className="border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user.name || user.email}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === "overview" ? "bg-[#2e2e2e] text-[#c9a96e]" : "hover:bg-[#2e2e2e]"}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === "orders" ? "bg-[#2e2e2e] text-[#c9a96e]" : "hover:bg-[#2e2e2e]"}`}
                >
                  Order History
                </button>
                <button
                  onClick={() => setActiveTab("measurements")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === "measurements" ? "bg-[#2e2e2e] text-[#c9a96e]" : "hover:bg-[#2e2e2e]"}`}
                >
                  Saved Measurements
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === "profile" ? "bg-[#2e2e2e] text-[#c9a96e]" : "hover:bg-[#2e2e2e]"}`}
                >
                  Profile Settings
                </button>
                <Link
                  href="/account/refunds"
                  className="block w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-[#2e2e2e]"
                >
                  Refunds and Returns
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-[#2e2e2e]">
                <Link
                  href="/api/auth/logout"
                  className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#2e2e2e] transition-colors text-red-400"
                >
                  Sign Out
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                  <h2 className="text-xl font-semibold mb-4">
                    Welcome to Your Tailoring Dashboard
                  </h2>
                  <p className="text-gray-400">
                    Here you can track your custom suit orders, manage your
                    measurements, and update your profile.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                    <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold text-[#c9a96e]">
                      {orders.length}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Custom suits ordered
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                    <h3 className="text-lg font-semibold mb-2">
                      Active Orders
                    </h3>
                    <p className="text-3xl font-bold text-[#c9a96e]">
                      {
                        orders.filter(
                          (o) =>
                            o.status.toLowerCase() === "processing" ||
                            o.status.toLowerCase() === "pending",
                        ).length
                      }
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Currently in production
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                    <h3 className="text-lg font-semibold mb-2">Completed</h3>
                    <p className="text-3xl font-bold text-[#c9a96e]">
                      {
                        orders.filter(
                          (o) => o.status.toLowerCase() === "completed",
                        ).length
                      }
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Suits delivered
                    </p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-[#c9a96e] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No orders yet. Start your first custom suit!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-[#2e2e2e] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                        >
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-gray-400">
                              {formatDate(order.createdAt)} •{" "}
                              {order.orderedItems} items
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                            <p className="font-mono font-semibold">£{Number(order.total).toFixed(2)}</p>
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-[#c9a96e] hover:underline text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                  <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/shop/suits"
                      className="p-4 bg-[#2e2e2e] rounded-lg hover:bg-[#3a3a3a] transition-colors flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#c9a96e]/20 flex items-center justify-center">
                        <span className="text-[#c9a96e]">✨</span>
                      </div>
                      <div>
                        <p className="font-medium">Start New Suit</p>
                        <p className="text-sm text-gray-400">
                          Design a custom suit
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => setActiveTab("measurements")}
                      className="p-4 bg-[#2e2e2e] rounded-lg hover:bg-[#3a3a3a] transition-colors flex items-center gap-4 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#c9a96e]/20 flex items-center justify-center">
                        <span className="text-[#c9a96e]">📏</span>
                      </div>
                      <div>
                        <p className="font-medium">Update Measurements</p>
                        <p className="text-sm text-gray-400">
                          Edit your body measurements
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                <h2 className="text-xl font-semibold mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg mb-4">No orders yet</p>
                    <p className="text-gray-500 mb-6">
                      Start your first custom suit journey
                    </p>
                    <Link
                      href="/shop/suits"
                      className="inline-block bg-[#c9a96e] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#d8b87c] transition-colors"
                    >
                      Browse Suits
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-6 bg-[#2e2e2e] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <p className="font-bold text-lg">
                                Order #{order.id}
                              </p>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-gray-400">
                              Placed on {formatDate(order.createdAt)} •{" "}
                              {order.orderedItems} items • Total: £{Number(order.total).toFixed(2)}
                            </p>
                            {order.estimatedDeliveryDate && (
                              <p className="text-sm text-gray-400 mt-1">
                                Estimated delivery:{" "}
                                {formatDate(order.estimatedDeliveryDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-4">
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="px-4 py-2 border border-[#c9a96e] text-[#c9a96e] rounded-lg hover:bg-[#c9a96e]/10 transition-colors"
                            >
                              View Details
                            </Link>
                            <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                              Track Order
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "measurements" && (
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Saved Measurements
                  </h2>
                  {!showMeasForm && (
                    <button
                      onClick={openNewMeasForm}
                      className="px-4 py-2 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors text-sm"
                    >
                      + New Profile
                    </button>
                  )}
                </div>

                {/* Measurement Form (create/edit) */}
                {showMeasForm && (
                  <div className="mb-8 p-6 bg-[#2e2e2e] rounded-lg border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingMeasId ? "Edit Measurement Profile" : "New Measurement Profile"}
                    </h3>

                    {measMessage && (
                      <div
                        className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                          measMessage.includes("successfully")
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {measMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">
                          Profile Name
                        </label>
                        <input
                          type="text"
                          value={measForm.profileName}
                          onChange={(e) =>
                            setMeasForm({ ...measForm, profileName: e.target.value })
                          }
                          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                          placeholder="e.g. My Measurements, Slim Fit, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Unit
                        </label>
                        <select
                          value={measForm.unit}
                          onChange={(e) =>
                            setMeasForm({ ...measForm, unit: e.target.value as "cm" | "in" })
                          }
                          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                        >
                          <option value="cm">Centimeters (cm)</option>
                          <option value="in">Inches (in)</option>
                        </select>
                      </div>
                      {MEASUREMENT_FIELDS.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm text-gray-400 mb-2">
                            {field.label} ({measForm.unit})
                          </label>
                          <input
                            type="number"
                            value={measForm[field.key]}
                            onChange={(e) =>
                              setMeasForm({ ...measForm, [field.key]: e.target.value })
                            }
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                            placeholder="0"
                            step="0.1"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={measForm.isDefault}
                          onChange={(e) =>
                            setMeasForm({ ...measForm, isDefault: e.target.checked })
                          }
                          className="rounded border-gray-600 bg-[#1a1a1a] text-[#c9a96e]"
                        />
                        <span className="text-sm text-gray-300">
                          Set as default measurement profile
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMeasForm(false);
                          resetMeasForm();
                        }}
                        className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMeasurement}
                        disabled={measSaving}
                        className="px-6 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors disabled:opacity-50"
                      >
                        {measSaving
                          ? "Saving..."
                          : editingMeasId
                            ? "Update Profile"
                            : "Save Profile"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Measurement Profiles List */}
                {measLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a96e] mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading profiles...</p>
                  </div>
                ) : measurementProfiles.length === 0 && !showMeasForm ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg mb-4">
                      No saved measurements yet
                    </p>
                    <p className="text-gray-500 mb-6">
                      Create your first measurement profile for faster ordering
                    </p>
                    <button
                      onClick={openNewMeasForm}
                      className="inline-block bg-[#c9a96e] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#d8b87c] transition-colors"
                    >
                      Create Measurement Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {measurementProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className={`p-4 bg-[#2e2e2e] rounded-lg border ${
                          profile.isDefault
                            ? "border-[#c9a96e]/50"
                            : "border-transparent"
                        } hover:bg-[#3a3a3a] transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {profile.profileName}
                              </h3>
                              {profile.isDefault && (
                                <span className="text-[10px] uppercase tracking-wider bg-[#c9a96e]/20 text-[#c9a96e] px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              Unit: {profile.unit}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!profile.isDefault && (
                              <button
                                onClick={() =>
                                  handleSetDefaultMeasurement(profile.id)
                                }
                                className="text-xs text-[#c9a96e] hover:underline"
                                title="Set as default"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => openEditMeasForm(profile)}
                              className="text-xs text-gray-400 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteMeasurement(profile.id)
                              }
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-sm">
                          {MEASUREMENT_FIELDS.map((field) => (
                            <div key={field.key}>
                              <span className="text-gray-500 text-xs block">
                                {field.label}
                              </span>
                              <span className="text-gray-200">
                                {profile[field.key]} {profile.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2e2e2e]">
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-[#2e2e2e] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          disabled
                          className="w-full bg-[#2e2e2e] border border-gray-700 rounded-lg px-4 py-3 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Email cannot be changed
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-[#2e2e2e] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Default Address
                        </label>
                        <textarea
                          value={profileAddress}
                          onChange={(e) => setProfileAddress(e.target.value)}
                          className="w-full bg-[#2e2e2e] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                          placeholder="Enter your default shipping address"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <h3 className="font-medium mb-4">
                      Notification Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 bg-[#2e2e2e] text-[#c9a96e]"
                          defaultChecked
                        />
                        <span>Order updates and shipping notifications</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 bg-[#2e2e2e] text-[#c9a96e]"
                          defaultChecked
                        />
                        <span>Tailoring tips and style advice</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 bg-[#2e2e2e] text-[#c9a96e]"
                        />
                        <span>Promotional offers and discounts</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    {saveMessage && (
                      <div
                        className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                          saveMessage === "Profile updated successfully"
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                      >
                        {saveMessage}
                      </div>
                    )}
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileName(user?.name || "");
                          setProfilePhone(user?.phone || "");
                          setProfileAddress(user?.address || "");
                          setSaveMessage(null);
                        }}
                        className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-6 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
