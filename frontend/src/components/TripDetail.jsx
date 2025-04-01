import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-arrowheads";
import "leaflet-polylinedecorator";
import { useState, useEffect } from "react";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import GeocoderControl from "./GeocoderControl";
import EditDayModal from "./EditDayModal";

// 修復 Leaflet 的圖標問題
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// 新增一個組件來處理地圖更新
function MapUpdater({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  return null;
}

// 移除 ArrowLine 組件，改用簡單的 Polyline
function RouteLine({ positions }) {
  return (
    <Polyline
      positions={positions}
      color="#3B82F6"
      weight={3}
      opacity={0.6}
      dashArray="5, 10"
    />
  );
}

function TripDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({
    transportation: {
      air: "",
      land: "",
      sea: "",
    },
    accommodation: {
      name: "",
      address: "",
      coordinates: { lat: 0, lng: 0 },
    },
    activities: [],
    meals: {
      breakfast: {
        restaurant: "",
        location: "",
        url: "",
      },
      lunch: {
        restaurant: "",
        location: "",
        url: "",
      },
      dinner: {
        restaurant: "",
        location: "",
        url: "",
      },
    },
    notes: "",
  });

  const {
    data: trip,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/trips/${id}`);
      return response.data;
    },
  });

  const updateDayMutation = useMutation({
    mutationFn: async ({ dayIndex, data }) => {
      const response = await axios.patch(
        `http://localhost:5000/api/trips/${id}/days/${dayIndex}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trip", id]);
      setEditingDay(null);
      setEditForm({
        transportation: {
          air: "",
          land: "",
          sea: "",
        },
        accommodation: {
          name: "",
          address: "",
          coordinates: { lat: 0, lng: 0 },
        },
        activities: [],
        meals: {
          breakfast: { restaurant: "", location: "", url: "" },
          lunch: { restaurant: "", location: "", url: "" },
          dinner: { restaurant: "", location: "", url: "" },
        },
        notes: "",
      });
    },
  });

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>發生錯誤: {error.message}</div>;

  const handleEditDay = (dayIndex, day) => {
    setEditingDay(dayIndex);
    setEditForm({
      transportation: day.transportation || {
        air: "",
        land: "",
        sea: "",
      },
      accommodation: day.accommodation || {
        name: "",
        address: "",
        coordinates: { lat: 0, lng: 0 },
      },
      activities: day.activities || [],
      meals: day.meals || {
        breakfast: { restaurant: "", location: "", url: "" },
        lunch: { restaurant: "", location: "", url: "" },
        dinner: { restaurant: "", location: "", url: "" },
      },
      notes: day.notes || "",
    });
  };

  const handleSaveDay = (dayIndex) => {
    const updatedData = {
      transportation: editForm.transportation,
      accommodation: editForm.accommodation,
      activities: editForm.activities,
      meals: editForm.meals,
      notes: editForm.notes,
    };
    updateDayMutation.mutate({ dayIndex, data: updatedData });
  };

  // 計算所有住宿點的邊界
  const bounds = trip?.days
    ? L.latLngBounds(
        trip.days
          .filter(
            (day) => day.accommodation?.coordinates && day.accommodation?.name
          )
          .map((day) => [
            day.accommodation.coordinates.lat,
            day.accommodation.coordinates.lng,
          ])
      )
    : null;

  // 計算路線座標
  const routeCoordinates = trip?.days
    ? trip.days
        .filter(
          (day) => day.accommodation?.coordinates && day.accommodation?.name
        )
        .map((day) => [
          day.accommodation.coordinates.lat,
          day.accommodation.coordinates.lng,
        ])
    : [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const weekday = weekdays[date.getDay()];
    return `${year}/${month}/${day}(${weekday})`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">{trip.destination}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">行程資訊</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="mb-2">開始日期: {formatDate(trip.startDate)}</p>
            <p className="mb-2">結束日期: {formatDate(trip.endDate)}</p>
            <p>天數: {trip.days.length} 天</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">地圖</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-[400px] rounded-lg overflow-hidden relative z-0">
              <MapContainer
                key={editingDay}
                center={[25.033, 121.565]}
                zoom={10}
                style={{ height: "100%", width: "100%" }}
                bounds={bounds}
                boundsOptions={{ padding: [50, 50] }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater bounds={bounds} />
                {routeCoordinates.length > 0 && (
                  <RouteLine positions={routeCoordinates} />
                )}
                {trip.days.map(
                  (day, index) =>
                    day.accommodation?.coordinates &&
                    day.accommodation?.name && (
                      <Marker
                        key={index}
                        position={[
                          day.accommodation.coordinates.lat,
                          day.accommodation.coordinates.lng,
                        ]}
                      >
                        <Popup>
                          第 {index + 1} 天住宿
                          <br />
                          {day.accommodation.name}
                        </Popup>
                      </Marker>
                    )
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">每日行程</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  交通
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住宿
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  餐廳
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trip.days.map((day, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      第 {index + 1} 天
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(day.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {day.transportation?.air && (
                        <p>空運: {day.transportation.air}</p>
                      )}
                      {day.transportation?.land && (
                        <p>陸運: {day.transportation.land}</p>
                      )}
                      {day.transportation?.sea && (
                        <p>海運: {day.transportation.sea}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {day.accommodation?.name || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {day.meals?.breakfast?.restaurant && (
                        <p>早餐: {day.meals.breakfast.restaurant}</p>
                      )}
                      {day.meals?.lunch?.restaurant && (
                        <p>午餐: {day.meals.lunch.restaurant}</p>
                      )}
                      {day.meals?.dinner?.restaurant && (
                        <p>晚餐: {day.meals.dinner.restaurant}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditDay(index, day)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      編輯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditDayModal
        isOpen={editingDay !== null}
        onClose={() => setEditingDay(null)}
        day={editingDay}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={() => handleSaveDay(editingDay)}
      />
    </div>
  );
}

export default TripDetail;
