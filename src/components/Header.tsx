import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
}

const Header = ({ title, onBack, actions }: HeaderProps) => (
  <div className="bg-gray-900/80 backdrop-blur-sm border-b border-red-900/30 sticky top-0 z-10">
    <div className="p-6 flex items-center justify-between">
      <div className="flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            {/* You can use an icon library or SVG for the arrow */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="ml-4 text-2xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  </div>
);

export default Header;
