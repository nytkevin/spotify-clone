"use client";

import { useState, useRef, useEffect } from "react";
import { usePlayer } from "@/app/context/playerContext";

export default function DeviceSelector() {
  const { devices, switchDevice } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeDevice = devices.find((d) => d.is_active);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDeviceClick = async (id: string) => {
    await switchDevice(id);
    setIsOpen(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "smartphone":
        return "smartphone";
      case "tablet":
        return "📱";
      case "speaker":
        return "🔊";
      case "tv":
        return "📺";
      case "automobile":
        return "🚗";
      case "computer":
      case "windows":
      default:
        return "💻";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-900 transition-colors duration-200 text-xs font-medium text-gray-200 hover:text-white"
        title={activeDevice?.name || "No device selected"}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H4V4h14v10z" />
        </svg>
        <span className="hidden sm:inline max-w-xs truncate">
          {activeDevice?.name || "No device"}
        </span>
      </button>

      {isOpen && devices.length > 0 && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-bold text-white">Available Devices</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => handleDeviceClick(device.id)}
                disabled={device.is_restricted}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  device.is_active
                    ? "bg-green-900 text-green-100 hover:bg-green-800"
                    : device.is_restricted
                      ? "text-gray-500 cursor-not-allowed bg-gray-800"
                      : "text-gray-300 hover:bg-gray-800"
                } border-b border-gray-800 last:border-b-0`}
              >
                <span className="text-lg shrink-0">
                  {getDeviceIcon(device.type)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{device.name}</p>
                  <p className="text-xs opacity-75 capitalize">{device.type}</p>
                  {device.volume_percent !== null && (
                    <p className="text-xs opacity-60">
                      Volume: {device.volume_percent}%
                    </p>
                  )}
                </div>

                {device.is_active && (
                  <div className="hrink-0 w-3 h-3 rounded-full bg-green-400" />
                )}

                {device.is_restricted && (
                  <span className="shrink-0 text-xs bg-red-900 px-2 py-1 rounded">
                    Restricted
                  </span>
                )}
              </button>
            ))}
          </div>

          {devices.length > 0 && (
            <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-700">
              {devices.filter((d) => d.is_active).length} active
            </div>
          )}
        </div>
      )}

      {isOpen && devices.length === 0 && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4">
          <p className="text-sm text-gray-400 text-center">
            No devices available
          </p>
        </div>
      )}
    </div>
  );
}
