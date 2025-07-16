import { Calendar } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Logo Icon Background */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-1.5 shadow-lg">
          <Calendar className={`${sizeClasses[size]} text-white`} />
        </div>
        {/* Small accent dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>
      </div>

      {showText && (
        <span
          className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizeClasses[size]} tracking-wide`}
        >
          EventHub
        </span>
      )}
    </div>
  );
}
