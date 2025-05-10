import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAdminProfile,
  updateLanguagePreference,
  setAgentStatus,
} from "../../redux/user/userThunks";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { resetError, resetSuccessMessage } from "../../redux/user/userSlice";
import toast from "react-hot-toast";
import languagesModule from "../../utils/languages";
import { Globe } from "lucide-react";

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error, successMessage } = useSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Convert languages object to array for dropdown
  const languageOptions = Object.entries(languagesModule.byCode).map(
    ([code, name]) => ({
      value: code,
      label: name,
    })
  );

  // Load user data when component mounts or when user is updated
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Show toast notification when profile is updated successfully or error occurs
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(resetSuccessMessage());
    }

    if (error) {
      toast.error(error);
      dispatch(resetError());
    }
  }, [successMessage, error, user, dispatch]);

  // Clear error and success messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetError());
      dispatch(resetSuccessMessage());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const handleStatusToggle = () => {
    const currentStatus = user?.status || "Not Active";

    // Toggle between the two status options
    const newStatus = currentStatus === "Active" ? "Not Active" : "Active";

    dispatch(setAgentStatus(newStatus));
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    dispatch(updateLanguagePreference(language));
  };

  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Password validation (only if user is attempting to change password)
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword =
          "Current password is required to set a new password";
      }

      if (formData.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    // Create payload based on what's changed
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username,
    };

    // Only include password fields if user is changing password
    if (formData.newPassword && formData.currentPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
      payload.confirmPassword = formData.confirmPassword;
    }

    dispatch(updateAdminProfile(payload));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">General Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          {/* Status Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Availability Status</h2>
              <p className="text-gray-500">
                Toggle your status to let clients know if you are available to
                handle inquiries
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`mr-3 font-medium ${
                  user?.status === "Active" ? "text-green-600" : "text-gray-500"
                }`}
              >
                {user?.status || "Not Active"}
              </span>
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={isLoading}
                aria-pressed={user?.status === "Active"}
                aria-label={`Set status to ${
                  user?.status === "Active" ? "Not Active" : "Active"
                }`}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  user?.status === "Active" ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    user?.status === "Active"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language Dropdown */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              <h2 className="text-lg font-medium">Language Preference</h2>
              <p className="text-gray-500">
                Select your preferred language for the application interface
              </p>
            </div>
            <div className="w-60">
              <select
                value={user?.language || "en"}
                onChange={handleLanguageChange}
                disabled={isLoading}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={validationErrors.firstName}
              />

              <Input
                label="Last Name"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={validationErrors.lastName}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={validationErrors.email}
                helperText="Your email will be checked for duplicates"
              />

              <Input
                label="Username"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                error={validationErrors.username}
                helperText="Your username will be checked for duplicates"
              />
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>

              <Input
                label="Current Password"
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                error={validationErrors.currentPassword}
                helperText="Required only if changing password"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="New Password"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={validationErrors.newPassword}
                  helperText="Minimum 6 characters"
                />

                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={validationErrors.confirmPassword}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
