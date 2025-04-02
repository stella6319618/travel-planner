import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";

function TripList() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: "",
    startDate: "",
    endDate: "",
  });

  const {
    data: trips,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/trips");
      return response.data;
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        "http://localhost:5000/api/trips",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"]);
      setShowCreateForm(false);
      setNewTrip({
        destination: "",
        startDate: "",
        endDate: "",
      });
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(
        `http://localhost:5000/api/trips/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"]);
    },
  });

  const handleCreateTrip = (e) => {
    e.preventDefault();
    createTripMutation.mutate(newTrip);
  };

  const handleDeleteTrip = (id) => {
    if (window.confirm("確定要刪除這個旅程嗎？")) {
      deleteTripMutation.mutate(id);
    }
  };

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>發生錯誤: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的旅程</h1>
        <Link
          to="/trips/new"
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md"
        >
          新增行程
        </Link>
      </div>
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">新增旅程</h2>
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">目的地</label>
              <input
                type="text"
                value={newTrip.destination}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, destination: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">開始日期</label>
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, startDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">結束日期</label>
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, endDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                創建
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div key={trip._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{trip.destination}</h3>
            <p className="text-gray-600 mb-2">
              開始日期: {new Date(trip.startDate).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-4">
              結束日期: {new Date(trip.endDate).toLocaleDateString()}
            </p>
            <div className="flex justify-between items-center">
              <Link
                to={`/trips/${trip._id}`}
                className="text-blue-500 hover:text-blue-700"
              >
                查看詳情
              </Link>
              <button
                onClick={() => handleDeleteTrip(trip._id)}
                className="text-red-500 hover:text-red-700"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TripList;
