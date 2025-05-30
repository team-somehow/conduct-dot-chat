import React from 'react';

// TODO(Settings):
// 1. Add API key management
// 2. Implement user preferences
// 3. Add notification settings
// 4. Create theme customization
// 5. Add data export/import options
// END TODO

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
          {/* API settings will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          {/* User preferences will go here */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 