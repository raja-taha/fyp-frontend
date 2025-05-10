import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  className = "",
  footer,
  headerAction,
  bordered = true,
  flat = false,
  padding = "normal",
  ...props
}) => {
  const baseClasses = "bg-white rounded-lg overflow-hidden";
  const borderClasses = bordered ? "border border-gray-200" : "";
  const shadowClasses = !flat ? "shadow-md" : "";

  const paddingMap = {
    none: "",
    small: "p-2",
    normal: "p-4",
    large: "p-6",
  };

  const paddingClasses = paddingMap[padding] || paddingMap.normal;

  return (
    <div
      className={`
        ${baseClasses}
        ${borderClasses}
        ${shadowClasses}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            )}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={paddingClasses}>{children}</div>

      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
