import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function App() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // ---------------------------
  // Fetch Users
  // ---------------------------
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("/api/users");
      if (res.data.success) return res.data.data;
      throw new Error(res.data.error || "Failed to fetch users");
    },
  });

  // ---------------------------
  // Add User Mutation
  // ---------------------------
  const addUserMutation = useMutation({
    mutationFn: async (newUser) => {
      const res = await axios.post("/api/users", newUser);
      if (res.data.success) return res.data.data;
      throw new Error(res.data.error || "Failed to add user");
    },
    onSuccess: (newUser) => {
      // Update the users query cache
      queryClient.setQueryData(["users"], (old = []) => [...old, newUser]);
      setName("");
      setEmail("");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updateUser) => {
      const res = await axios.put(`/api/users/${updateUser.id}`, updateUser);
      if (res.data.success) return res.data.data;
      throw new Error(res.data.error || "Failed to update user");
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users"], (old = []) =>
        old.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );
      closeModal();
    },
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!email) return alert("Email is required");
    addUserMutation.mutate({ name, email });
  };
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setIsModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!email) return alert("Email is required");
    updateUserMutation.mutate({ id: selectedUser.id, name, email });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setName("");
    setEmail("");
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Users</h1>

        {/* Add User Form */}
        <form
          onSubmit={handleAddUser}
          className="mb-6 p-4 bg-white rounded-lg shadow space-y-4"
        >
          <h2 className="text-xl font-semibold">Add User</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              placeholder="user@example.com"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={addUserMutation.isLoading}
          >
            {addUserMutation.isLoading ? "Adding..." : "Add User"}
          </button>
        </form>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          {users.length === 0 ? (
            <p className="p-4 text-gray-500">No users yet</p>
          ) : (
            <ul className="divide-y space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex  justify-between items-center p-4"
                >
                  <div className="">
                    <div className="font-medium">{user.name || "No name"}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="bg-yellow-500 rounded-3xl">
                    <button
                      className="border-amber-600 cursor-pointer"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit button
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  disabled={updateUserMutation.isLoading}
                >
                  {updateUserMutation.isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
