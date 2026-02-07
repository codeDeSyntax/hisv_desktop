import React, { useState, useEffect } from "react";
import { Button, Tooltip, message } from "antd";
import { Monitor } from "lucide-react";
import { useProjectionControl, useProjectionSync } from "@/hooks/useProjection";

export const ProjectionToggle: React.FC = () => {
  const { createProjection, closeProjection, checkStatus } =
    useProjectionControl();
  const { updateSermonData } = useProjectionSync();
  const [isProjectionActive, setIsProjectionActive] = useState(false);
  const [hasExternalDisplay, setHasExternalDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check projection status on mount
  useEffect(() => {
    const checkProjectionStatus = async () => {
      const status = await checkStatus();
      if (status) {
        setIsProjectionActive(status.isActive);
        setHasExternalDisplay(status.hasExternalDisplay);
      }
    };

    checkProjectionStatus();

    // Listen for projection state changes
    const handleStateChange = (event: any, isActive: boolean) => {
      setIsProjectionActive(isActive);
    };

    // Listen for display changes
    const handleDisplaysChanged = (event: any, data: any) => {
      setHasExternalDisplay(data.hasExternalDisplay);
      console.log(
        "Displays changed:",
        data.hasExternalDisplay
          ? "External display detected"
          : "No external display",
      );
    };

    if (window.ipcRenderer) {
      window.ipcRenderer.on("projection-state-changed", handleStateChange);
      window.ipcRenderer.on("displays-changed", handleDisplaysChanged);

      return () => {
        window.ipcRenderer.off("projection-state-changed", handleStateChange);
        window.ipcRenderer.off("displays-changed", handleDisplaysChanged);
      };
    }
  }, [checkStatus]);

  const handleToggleProjection = async () => {
    setIsLoading(true);

    try {
      if (isProjectionActive) {
        // Close projection
        const success = await closeProjection();
        if (success) {
          setIsProjectionActive(false);
          message.success("Projection closed");
        } else {
          message.error("Failed to close projection");
        }
      } else {
        // Create projection - only allow if external display exists
        if (!hasExternalDisplay) {
          message.error(
            "No external display detected. Projection requires an external display.",
          );
          setIsLoading(false);
          return;
        }

        const success = await createProjection();
        if (success) {
          setIsProjectionActive(true);
          message.success("Projection started");
        } else {
          message.error("Failed to create projection");
        }
      }
    } catch (error) {
      console.error("Error toggling projection:", error);
      message.error("Error toggling projection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip
      title={
        isProjectionActive
          ? "Stop projection"
          : hasExternalDisplay
            ? "Start projection on external display"
            : "No external display detected - projection unavailable"
      }
      placement="top"
    >
      <Button
        onClick={handleToggleProjection}
        loading={isLoading}
        type={isProjectionActive ? "primary" : "default"}
        danger={isProjectionActive}
        size="small"
        className={`flex items-center gap-1 ${
          isProjectionActive
            ? "!bg-red-600 hover:!bg-red-700 !border-red-600"
            : ""
        }`}
        icon={
          <Monitor
            size={16}
            className={isProjectionActive ? "text-white" : ""}
          />
        }
      >
        <span className="text-xs">
          {isProjectionActive ? "Projecting" : "Project"}
        </span>
      </Button>
    </Tooltip>
  );
};

export default ProjectionToggle;
