"use client";

import { useState } from "react";

export default function CustomerSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    invoiceAlerts: true,
    paymentReminders: true,
    language: "en",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
  });
  const [success, setSuccess] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
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
                  settings.emailNotifications ? "bg-emerald-600" : "bg-gray-300"
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
                <p className="font-medium text-gray-700">Invoice Alerts</p>
                <p className="text-sm text-gray-500">
                  Get notified when you receive new invoices
                </p>
              </div>
              <button
                onClick={() => handleToggle("invoiceAlerts")}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.invoiceAlerts ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.invoiceAlerts ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Payment Reminders</p>
                <p className="text-sm text-gray-500">
                  Receive reminders about upcoming payment due dates
                </p>
              </div>
              <button
                onClick={() => handleToggle("paymentReminders")}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.paymentReminders ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.paymentReminders ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Regional Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSelect("language", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ms">Malay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleSelect("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="MYR">MYR - Malaysian Ringgit</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSelect("dateFormat", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
