"use client";

import { useNavigation } from "../../../contexts/NavigationContext";
import { HiChevronRight, HiHome } from "react-icons/hi";

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumb({ className = "" }: BreadcrumbProps) {
  const { navigation, navigateToIndex, resetToSection } = useNavigation();
  const { stack, currentSection } = navigation;

  const getSectionLabel = (section: string): string => {
    const sectionLabels: Record<string, string> = {
      itinerary: "Itinerary",
      employees: "Personal", 
      notes: "Agenda",
      accounting: "Accounting",
      stats: "Statistics"
    };
    return sectionLabels[section] || section;
  };

  const handleSectionClick = () => {
    resetToSection(currentSection);
  };

  const handleBreadcrumbClick = (index: number) => {
    navigateToIndex(index);
  };

  if (stack.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <button
        onClick={handleSectionClick}
        className="flex items-center gap-1 text-accent-600 hover:text-accent-700 dark:text-accent-300 dark:hover:text-accent-200 transition-colors"
      >
        <HiHome className="h-4 w-4" />
        <span>{getSectionLabel(currentSection)}</span>
      </button>
      
      {stack.map((item, index) => (
        <div key={item.id} className="flex items-center space-x-2">
          <HiChevronRight className="h-4 w-4 text-gray-400" />
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className={`transition-colors ${
              index === stack.length - 1
                ? "text-gray-900 dark:text-gray-100 cursor-default"
                : "text-accent-600 hover:text-accent-700 dark:text-accent-300 dark:hover:text-accent-200"
            }`}
            disabled={index === stack.length - 1}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
}