import { forwardRef } from "react";

const Input = forwardRef(({ label, error, helperText, icon: Icon, className = "", inputClassName = "", uppercase = false, ...props }, ref) => {
  const handleChange = (e) => {
    if (uppercase) {
      e.target.value = e.target.value.toUpperCase();
    }
    props.onChange?.(e);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          {...props}
          onChange={handleChange}
          className={`
            block w-full rounded-xl border-2 bg-white
            transition-all duration-200
            placeholder:text-slate-400
            focus:outline-none focus:ring-0
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${Icon ? "pl-11" : "pl-4"}
            pr-4 py-3
            ${error ? "border-red-300 focus:border-red-500 text-red-900" : "border-slate-200 focus:border-blue-500 text-slate-900 hover:border-slate-300"}
            ${inputClassName}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
