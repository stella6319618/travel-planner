import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateTrip() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        "http://localhost:5000/api/trips",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"]);
      navigate("/");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">新增行程</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            目的地
          </label>
          <input
            type="text"
            {...register("destination", { required: "請輸入目的地" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">
              {errors.destination.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            開始日期
          </label>
          <input
            type="date"
            {...register("startDate", { required: "請選擇開始日期" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            結束日期
          </label>
          <input
            type="date"
            {...register("endDate", { required: "請選擇結束日期" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "儲存中..." : "儲存行程"}
        </button>
      </form>
    </div>
  );
}

export default CreateTrip;
