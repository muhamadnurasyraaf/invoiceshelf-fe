"use client";

import { useState, useEffect } from "react";
import { taxService, Tax } from "@/lib/taxes";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    invoiceReminders: true,
    weeklyReports: false,
    darkMode: false,
  });
  const [success, setSuccess] = useState(false);

  // Tax state
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(true);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxForm, setTaxForm] = useState({
    name: "",
    rate: "",
    description: "",
    isDefault: false,
  });
  const [taxError, setTaxError] = useState<string | null>(null);
  const [isSavingTax, setIsSavingTax] = useState(false);

  useEffect(() => {
    loadTaxes();
  }, []);

  const loadTaxes = async () => {
    try {
      setIsLoadingTaxes(true);
      const data = await taxService.getAll();
      setTaxes(data);
    } catch {
      setTaxError("Failed to load taxes");
    } finally {
      setIsLoadingTaxes(false);
    }
  };

  const handleOpenTaxModal = (tax?: Tax) => {
    if (tax) {
      setEditingTax(tax);
      setTaxForm({
        name: tax.name,
        rate: tax.rate.toString(),
        description: tax.description || "",
        isDefault: tax.isDefault,
      });
    } else {
      setEditingTax(null);
      setTaxForm({
        name: "",
        rate: "",
        description: "",
        isDefault: false,
      });
    }
    setTaxError(null);
    setShowTaxModal(true);
  };

  const handleCloseTaxModal = () => {
    setShowTaxModal(false);
    setEditingTax(null);
    setTaxForm({
      name: "",
      rate: "",
      description: "",
      isDefault: false,
    });
    setTaxError(null);
  };

  const handleTaxSubmit = async () => {
    if (!taxForm.name.trim()) {
      setTaxError("Name is required");
      return;
    }

    const rate = parseFloat(taxForm.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setTaxError("Rate must be a number between 0 and 100");
      return;
    }

    try {
      setIsSavingTax(true);
      setTaxError(null);

      const taxData = {
        name: taxForm.name.trim(),
        rate,
        description: taxForm.description.trim() || undefined,
        isDefault: taxForm.isDefault,
      };

      if (editingTax) {
        const updated = await taxService.update(editingTax.id, taxData);
        setTaxes(taxes.map((t) => (t.id === editingTax.id ? updated : t)));
      } else {
        const created = await taxService.create(taxData);
        setTaxes([...taxes, created]);
      }

      handleCloseTaxModal();
    } catch {
      setTaxError(editingTax ? "Failed to update tax" : "Failed to create tax");
    } finally {
      setIsSavingTax(false);
    }
  };

  const handleDeleteTax = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tax?")) return;

    try {
      await taxService.delete(id);
      setTaxes(taxes.filter((t) => t.id !== id));
    } catch {
      setTaxError("Failed to delete tax");
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    // TODO: Implement API call to save settings
    console.log("Settings saved:", settings);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
            Settings saved successfully!
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive email notifications for important updates
                </p>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.emailNotifications ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.emailNotifications ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Invoice Reminders</p>
                <p className="text-sm text-gray-500">
                  Get reminded about unpaid invoices
                </p>
              </div>
              <button
                onClick={() => handleToggle("invoiceReminders")}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.invoiceReminders ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.invoiceReminders ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Weekly Reports</p>
                <p className="text-sm text-gray-500">
                  Receive weekly summary reports via email
                </p>
              </div>
              <button
                onClick={() => handleToggle("weeklyReports")}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.weeklyReports ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.weeklyReports ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Dark Mode</p>
                <p className="text-sm text-gray-500">
                  Use dark theme for the interface
                </p>
              </div>
              <button
                onClick={() => handleToggle("darkMode")}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.darkMode ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.darkMode ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Tax Settings
            </h2>
            <button
              onClick={() => handleOpenTaxModal()}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Tax
            </button>
          </div>

          {taxError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {taxError}
            </div>
          )}

          {isLoadingTaxes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : taxes.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm">No taxes configured yet</p>
              <button
                onClick={() => handleOpenTaxModal()}
                className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Add your first tax
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taxes.map((tax) => (
                    <tr key={tax.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {tax.name}
                          </span>
                          {tax.isDefault && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        {tax.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {tax.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {tax.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTaxModal(tax)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTax(tax.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Save Settings
        </button>
      </div>

      {/* Tax Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTax ? "Edit Tax" : "Add New Tax"}
              </h3>

              {taxError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {taxError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taxForm.name}
                    onChange={(e) =>
                      setTaxForm({ ...taxForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="e.g., VAT, GST, Sales Tax"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={taxForm.rate}
                    onChange={(e) =>
                      setTaxForm({ ...taxForm, rate: e.target.value })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={taxForm.description}
                    onChange={(e) =>
                      setTaxForm({ ...taxForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Set as Default</p>
                    <p className="text-sm text-gray-500">
                      Automatically apply this tax to new invoices
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTaxForm({ ...taxForm, isDefault: !taxForm.isDefault })
                    }
                    className={`relative w-12 h-6 rounded-full transition ${
                      taxForm.isDefault ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        taxForm.isDefault ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleCloseTaxModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTaxSubmit}
                  disabled={isSavingTax}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                >
                  {isSavingTax
                    ? "Saving..."
                    : editingTax
                      ? "Save Changes"
                      : "Create Tax"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
