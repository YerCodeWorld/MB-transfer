"use client";

import { useState } from "react";
import { 
  HiOutlinePlus, 
  HiOutlineCog, 
  HiOutlineSearch, 
  HiOutlineDownload,
  HiChevronLeft,
  HiOutlineRefresh,
  HiOutlineSave,
  HiOutlineDotsHorizontal
} from "react-icons/hi";
import {  
  PiIdentificationBadgeBold,  
  PiBuildingsBold,  
  PiCarSimpleBold,
  PiNotebookBold,
  PiBellRingingBold, 
  PiCalendarCheckBold
} from "react-icons/pi";
import { useNavigation } from "../../../contexts/NavigationContext";
import { useBottomBar } from "../../../contexts/BottomBarContext";

interface ActionItem {
  key: string;
  label: string;
  Icon: any;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}

interface BottomBarProps {
  section: string;
  mini?: boolean;
  className?: string;
}

// Dynamic bottom bar that receives actions from active components through BottomBarContext

export default function BottomBar({ section, mini = false, className = "" }: BottomBarProps) {

  const { navigation, popView } = useNavigation();
  const { actions: contextActions } = useBottomBar();
  const [showMore, setShowMore] = useState(false);
  
  const isInNestedView = navigation.stack.length > 0;
  const currentView = isInNestedView ? navigation.stack[navigation.stack.length - 1] : null;

  // TODO
  // The components are being updated in such a way that they themselves use a hook to populate the bottom bar instead
  // remove this useless logic 
  const sectionActions: Record<string, ActionItem[]> = {
    itinerary: [
      { key: "new", label: "New Service", Icon: HiOutlinePlus, variant: "primary" },
      { key: "search", label: "Search", Icon: HiOutlineSearch },
      { key: "export", label: "Export", Icon: HiOutlineDownload },
      { key: "refresh", label: "Refresh", Icon: HiOutlineRefresh },
      { key: "settings", label: "Settings", Icon: HiOutlineCog },
    ],
    notes: [
      { key: "note", label: "New Note", Icon: PiNotebookBold, variant: "primary" },
      { key: "event", label: "New Event", Icon: PiBellRingingBold },
      { key: "reminder", label: "New Reminder", Icon: PiCalendarCheckBold },      
      { key: "search", label: "Search", Icon: HiOutlineSearch },
      { key: "export", label: "Export", Icon: HiOutlineDownload },
    ],
    employees: [
      { key: "staff", label: "Empleados", Icon: PiIdentificationBadgeBold },
      { key: "companies", label: "Compañías", Icon: PiBuildingsBold },
      { key: "vehicles", label: "Vehículos", Icon: PiCarSimpleBold },
      { key: "new", label: "Add New", Icon: HiOutlinePlus, variant: "primary" },
    ],
    accounting: [
      { key: "new", label: "New Entry", Icon: HiOutlinePlus, variant: "primary" },
      { key: "search", label: "Search", Icon: HiOutlineSearch },
      { key: "export", label: "Export", Icon: HiOutlineDownload },
      { key: "settings", label: "Settings", Icon: HiOutlineCog },
    ],
    stats: [
      { key: "refresh", label: "Refresh", Icon: HiOutlineRefresh, variant: "primary" },
      { key: "export", label: "Export", Icon: HiOutlineDownload },
      { key: "settings", label: "Settings", Icon: HiOutlineCog },
    ],
  };

  // Contextual actions for nested views
  const getNestedViewActions = (): ActionItem[] => {
    if (!currentView) return [];

    const baseActions: ActionItem[] = [
      { 
        key: "back", 
        label: "Back", 
        Icon: HiChevronLeft, 
        variant: "secondary",
        onClick: () => popView()
      }
    ];

    // Add contextual actions based on service type
    if (currentView.data?.serviceType) {
      const serviceType = currentView.data.serviceType;
      
      switch (serviceType) {
        case "all":
          return [
            ...baseActions,
            { key: "save", label: "Save Changes", Icon: HiOutlineSave, variant: "primary" },
            { key: "refresh", label: "Refresh", Icon: HiOutlineRefresh },
            { key: "export", label: "Export All", Icon: HiOutlineDownload },
          ];
        case "at":
          return [
            ...baseActions,
            { key: "fetch", label: "Fetch Data", Icon: HiOutlineRefresh, variant: "primary" },
            { key: "settings", label: "API Settings", Icon: HiOutlineCog },
          ];
        case "st":
          return [
            ...baseActions,
            { key: "upload", label: "Upload XLSX", Icon: HiOutlinePlus, variant: "primary" },
            { key: "template", label: "Download Template", Icon: HiOutlineDownload },
          ];
        case "mbt":
          return [
            ...baseActions,
            { key: "create", label: "Create Service", Icon: HiOutlinePlus, variant: "primary" },
            { key: "save", label: "Save Draft", Icon: HiOutlineSave },
          ];
      }
    }

    return baseActions;
  };

  // Use context actions if available, otherwise fall back to hardcoded actions
  const actions = contextActions.length > 0 
    ? contextActions 
    : isInNestedView 
      ? getNestedViewActions() 
      : sectionActions[section] ?? [];

  
  // Split actions for responsive design
  const maxVisibleActions = mini ? 3 : 5;
  const visibleActions = actions.slice(0, maxVisibleActions);
  const hiddenActions = actions.slice(maxVisibleActions);

  const handleActionClick = (action: ActionItem) => {
    if (action.onClick) {
      action.onClick();
    } else {
      // ...
    }
  };

  const getActionButtonClass = (variant?: string) => {
    const baseClass = "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case "primary":
        return `${baseClass} bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 shadow-lg hover:shadow-xl`;
      case "danger":
        return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case "secondary":
        return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`;
      default:
        return `${baseClass} text-navy-700 hover:bg-accent-50 hover:text-accent-700 focus:ring-accent-400 dark:text-white dark:hover:bg-white/10`;
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-2 p-1 ${className}`}>
      {/* THIS DIV SHOWS BELOW MODALS */}
      <div className="flex items-center gap-2">
      
        {/* Main action bar */}
        {/* THESE ONE SHOWS ABOVE */}
        <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-xl dark:border-gray-700 dark:bg-navy-800/95">
          {visibleActions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={getActionButtonClass(action.variant)}
              title={action.label}
            >
              <action.Icon className="text-lg" />
              <span className="hidden sm:inline whitespace-nowrap">{action.label}</span>
            </button>
          ))}
          
          {/* More actions button */}
          {hiddenActions.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={getActionButtonClass()}
              title="More actions"
            >
              <HiOutlineDotsHorizontal className="text-lg" />
            </button>
          )}
        </div>

        {/* Extended actions */}
        {showMore && hiddenActions.length > 0 && (
          <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-lg p-2 shadow-xl dark:border-gray-700 dark:bg-navy-800/95">
            {hiddenActions.map((action) => (
              <button
                key={action.key}
                onClick={() => {
                  handleActionClick(action);
                  setShowMore(false);
                }}
                disabled={action.disabled}
                className={getActionButtonClass(action.variant)}
                title={action.label}
              >
                <action.Icon className="text-lg" />
                <span className="hidden sm:inline whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Context indicator */}
      {isInNestedView && currentView && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-1 text-xs font-medium text-accent-800 dark:bg-accent-800/20 dark:text-accent-200">
            {currentView.label}
          </span>
        </div>
      )}
    </div>
  );
}
