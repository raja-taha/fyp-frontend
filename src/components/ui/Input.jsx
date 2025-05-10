import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      id,
      name,
      type = "text",
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      disabled = false,
      readOnly = false,
      required = false,
      error,
      helperText,
      className = "",
      fullWidth = true,
      leftIcon = null,
      rightIcon = null,
      ...props
    },
    ref
  ) => {
    const baseInputClasses =
      "block px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const errorClasses = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300";
    const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
    const widthClasses = fullWidth ? "w-full" : "";
    const iconClasses = leftIcon ? "pl-10" : "";

    return (
      <div className={`${className} ${widthClasses}`}>
        {label && (
          <label
            htmlFor={id || name}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id || name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={`
              ${baseInputClasses}
              ${errorClasses}
              ${disabledClasses}
              ${widthClasses}
              ${iconClasses}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
