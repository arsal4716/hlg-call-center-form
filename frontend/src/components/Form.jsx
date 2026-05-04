import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { leadAPI } from "../api/api";

const Form = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncome, setShowIncome] = useState(false);

  // Dynamic schema based on QLE selection
  const getLeadSchema = (qle) => {
    return z.object({
      callerid: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(10, "Phone number must be exactly 10 digits")
        .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
      ZipCode: z
        .string()
        .length(5, "Zip code must be exactly 5 digits")
        .regex(/^\d{5}$/, "Invalid zip code"),
      income: qle
        ? z.number({
            required_error: "Income is required for QLE leads",
            invalid_type_error: "Please enter a valid income amount",
          })
          .min(1, "Income must be greater than 0")
          .max(999999999, "Income seems too high")
        : z.number().optional().nullable(),
      QLE: z.boolean(),
      agentname: z
        .string()
        .min(2, "Agent name is required")
        .max(100, "Agent name is too long"),
      vendor_code: z
        .string()
        .min(1, "Vendor code is required")
        .max(50, "Vendor code is too long"),
      lead_source: z
        .string()
        .min(1, "Lead source is required")
        .max(50, "Lead source is too long"),
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(getLeadSchema(false)),
    defaultValues: {
      callerid: "",
      ZipCode: "",
      income: null,
      QLE: false,
      agentname: "",
      vendor_code: "",
      lead_source: "",
    },
    mode: "onChange",
  });

  // Watch QLE value to show/hide income field
  const qleValue = watch("QLE");

  // Update showIncome and re-validate when QLE changes
  useEffect(() => {
    setShowIncome(qleValue);
    
    // Clear income value and errors when QLE is unchecked
    if (!qleValue) {
      setValue("income", null);
      clearErrors("income");
    }
    
    // Trigger re-validation of the form with updated schema
    trigger();
  }, [qleValue, setValue, clearErrors, trigger]);

  // Auto-format phone number to only allow digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setValue("callerid", value, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        income: data.QLE ? Number(data.income) : 0,
        callerid: data.callerid.replace(/\D/g, ''), // Clean phone number
      };

      const response = await leadAPI.createLead(submitData);

      if (response.success) {
        toast.success("Lead submitted successfully!");
        reset();
        setShowIncome(false);
      } else {
        toast.error("Failed to submit lead. Please try again.");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit lead";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition duration-150 ease-in-out";
  const errorClasses = "mt-1 text-sm text-red-600";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Caller ID */}
        <div>
          <label htmlFor="callerid" className={labelClasses}>
            Caller ID (Phone Number)
          </label>
          <input
            type="tel"
            id="callerid"
            {...register("callerid")}
            onChange={handlePhoneChange}
            className={`${inputClasses} ${errors.callerid ? "border-red-500" : ""}`}
            placeholder="1234567890"
            maxLength={10}
            inputMode="numeric"
          />
          {errors.callerid && (
            <p className={errorClasses}>{errors.callerid.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter 10-digit phone number without dashes
          </p>
        </div>

        {/* Zip Code */}
        <div>
          <label htmlFor="ZipCode" className={labelClasses}>
            Zip Code
          </label>
          <input
            type="text"
            id="ZipCode"
            {...register("ZipCode")}
            className={`${inputClasses} ${errors.ZipCode ? "border-red-500" : ""}`}
            placeholder="12345"
            maxLength={5}
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              setValue("ZipCode", value, { shouldValidate: true });
            }}
          />
          {errors.ZipCode && (
            <p className={errorClasses}>{errors.ZipCode.message}</p>
          )}
        </div>

        {/* Agent Name */}
        <div>
          <label htmlFor="agentname" className={labelClasses}>
            Agent Name
          </label>
          <input
            type="text"
            id="agentname"
            {...register("agentname")}
            className={`${inputClasses} ${errors.agentname ? "border-red-500" : ""}`}
            placeholder="John Doe"
          />
          {errors.agentname && (
            <p className={errorClasses}>{errors.agentname.message}</p>
          )}
        </div>

        {/* Vendor Code */}
        <div>
          <label htmlFor="vendor_code" className={labelClasses}>
            Vendor Code
          </label>
          <input
            type="text"
            id="vendor_code"
            {...register("vendor_code")}
            className={`${inputClasses} ${errors.vendor_code ? "border-red-500" : ""}`}
            placeholder="VENDOR001"
          />
          {errors.vendor_code && (
            <p className={errorClasses}>{errors.vendor_code.message}</p>
          )}
        </div>

        {/* Lead Source */}
        <div>
          <label htmlFor="lead_source" className={labelClasses}>
            Lead Source
          </label>
          <input
            type="text"
            id="lead_source"
            {...register("lead_source")}
            className={`${inputClasses} ${errors.lead_source ? "border-red-500" : ""}`}
            placeholder="Enter lead source (e.g. web, referral, facebook)"
          />
          {errors.lead_source && (
            <p className={errorClasses}>{errors.lead_source.message}</p>
          )}
        </div>

        {/* Income - Only shows and is required when QLE is checked */}
        {showIncome && (
          <div className="animate-fadeIn">
            <label htmlFor="income" className={labelClasses}>
              Annual Income ($)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              id="income"
              {...register("income", { valueAsNumber: true })}
              className={`${inputClasses} ${errors.income ? "border-red-500" : ""}`}
              placeholder="50000"
              min="0"
              step="100"
            />
            {errors.income && (
              <p className={errorClasses}>{errors.income.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Required for Qualified Life Event leads
            </p>
          </div>
        )}
      </div>

      {/* QLE Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id="QLE"
            {...register("QLE")}
            onChange={(e) => {
              setShowIncome(e.target.checked);
              if (!e.target.checked) {
                setValue("income", null);
                clearErrors("income");
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        <div className="ml-2">
          <label htmlFor="QLE" className="text-sm text-gray-900 font-medium">
            Qualified Life Event (QLE)
          </label>
          <p className="text-xs text-gray-500">
            Check this if the lead has a qualified life event (income information required)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end border-t pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Lead
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Add custom animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default Form;