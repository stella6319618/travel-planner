import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import GeocoderControl from "./GeocoderControl";

function EditDayModal({ isOpen, onClose, day, editForm, setEditForm, onSave }) {
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // 當 Modal 開啟時，延遲一下再更新 key，確保 Modal 完全顯示
      const timer = setTimeout(() => {
        setMapKey((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLocationSelect = (location) => {
    setEditForm((prev) => ({
      ...prev,
      accommodation: {
        ...prev.accommodation,
        address: location.name,
        coordinates: {
          lat: location.center[0],
          lng: location.center[1],
        },
      },
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  編輯第 {day + 1} 天行程
                </Dialog.Title>

                <div className="mt-2 space-y-6">
                  {/* 交通 */}
                  <div>
                    <h4 className="font-medium mb-2">交通</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium">
                          空運
                        </label>
                        <input
                          type="text"
                          value={editForm.transportation.air}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              transportation: {
                                ...editForm.transportation,
                                air: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          陸運
                        </label>
                        <input
                          type="text"
                          value={editForm.transportation.land}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              transportation: {
                                ...editForm.transportation,
                                land: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          海運
                        </label>
                        <input
                          type="text"
                          value={editForm.transportation.sea}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              transportation: {
                                ...editForm.transportation,
                                sea: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 住宿 */}
                  <div>
                    <h4 className="font-medium mb-2">住宿</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="住宿名稱"
                        value={editForm.accommodation.name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            accommodation: {
                              ...editForm.accommodation,
                              name: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 border rounded"
                      />
                      <GeocoderControl
                        value={editForm.accommodation.address}
                        onChange={(address) =>
                          setEditForm({
                            ...editForm,
                            accommodation: {
                              ...editForm.accommodation,
                              address: address,
                            },
                          })
                        }
                        onLocationSelect={handleLocationSelect}
                      />
                      {editForm.accommodation.coordinates && (
                        <div className="h-48 rounded-lg overflow-hidden relative z-0">
                          <MapContainer
                            key={mapKey}
                            center={[
                              editForm.accommodation.coordinates.lat,
                              editForm.accommodation.coordinates.lng,
                            ]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker
                              position={[
                                editForm.accommodation.coordinates.lat,
                                editForm.accommodation.coordinates.lng,
                              ]}
                            >
                              <Popup>{editForm.accommodation.name}</Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 餐點 */}
                  <div>
                    <h4 className="font-medium mb-2">餐廳</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium">
                          早餐
                        </label>
                        <input
                          type="text"
                          placeholder="餐廳名稱"
                          value={editForm.meals.breakfast.restaurant}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                breakfast: {
                                  ...editForm.meals.breakfast,
                                  restaurant: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        />
                        <input
                          type="text"
                          placeholder="地址"
                          value={editForm.meals.breakfast.location}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                breakfast: {
                                  ...editForm.meals.breakfast,
                                  location: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        />
                        <input
                          type="url"
                          placeholder="URL連結"
                          value={editForm.meals.breakfast.url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                breakfast: {
                                  ...editForm.meals.breakfast,
                                  url: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          午餐
                        </label>
                        <input
                          type="text"
                          placeholder="餐廳名稱"
                          value={editForm.meals.lunch.restaurant}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                lunch: {
                                  ...editForm.meals.lunch,
                                  restaurant: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        />
                        <input
                          type="text"
                          placeholder="地址"
                          value={editForm.meals.lunch.location}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                lunch: {
                                  ...editForm.meals.lunch,
                                  location: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        />
                        <input
                          type="url"
                          placeholder="URL連結"
                          value={editForm.meals.lunch.url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                lunch: {
                                  ...editForm.meals.lunch,
                                  url: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          晚餐
                        </label>
                        <input
                          type="text"
                          placeholder="餐廳名稱"
                          value={editForm.meals.dinner.restaurant}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                dinner: {
                                  ...editForm.meals.dinner,
                                  restaurant: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        />
                        <input
                          type="text"
                          placeholder="地址"
                          value={editForm.meals.dinner.location}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                dinner: {
                                  ...editForm.meals.dinner,
                                  location: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded mb-2"
                        />
                        <input
                          type="url"
                          placeholder="URL連結"
                          value={editForm.meals.dinner.url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              meals: {
                                ...editForm.meals,
                                dinner: {
                                  ...editForm.meals.dinner,
                                  url: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 備註 */}
                  <div>
                    <h4 className="font-medium mb-2">備註</h4>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onSave}
                  >
                    儲存
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditDayModal;
