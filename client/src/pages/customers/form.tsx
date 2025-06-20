import { type AnyFieldApi } from "@tanstack/react-form";

import { FieldError } from "@/components/common/field-error";
import { PhoneInput } from "@/components/phone-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerCardFormProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  isCreate?: boolean;
}

/**
 * Renders a scrollable form for entering or editing customer card details.
 *
 * Displays input fields for card number (conditionally), customer surname, name, patronymic, phone number, city, street, zip code, and discount percent. Each field is connected to form state and displays validation errors as needed. The discount percent input sanitizes user input to ensure only numeric values are stored.
 *
 * @param isCreate - If true, includes the card number field for creating a new customer card.
 */
export function CustomerCardForm({
  form,
  isCreate = false,
}: CustomerCardFormProps) {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4 mr-4 ml-4 pb-4">
        {isCreate && (
          <form.Field
            children={(field) => {
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Card Number</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Enter card number"
                    value={field.state.value as string}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                  />
                  <FieldError field={field} />
                </div>
              );
            }}
            name="card_number"
          />
        )}

        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Customer Surname</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter customer surname"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="cust_surname"
        />
        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Customer Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter customer name"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="cust_name"
        />
        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Customer Patronymic</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter customer patronymic"
                  required={false}
                  value={field.state.value as string | undefined}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="cust_patronymic"
        />

        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Phone Number</Label>
                <PhoneInput
                  id={field.name}
                  international={true}
                  name={field.name}
                  placeholder="Enter phone number"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    field.handleChange(value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="phone_number"
        />

        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>City</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter city"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="city"
        />

        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Street</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter street"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="street"
        />

        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Zip Code</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter zip code"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            );
          }}
          name="zip_code"
        />

        <form.Field
          children={(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Discount percent</Label>
                <div className="relative">
                  <Input
                    className="pr-8"
                    id={field.name}
                    name={field.name}
                    placeholder="Enter discount percent"
                    value={field.state.value as string}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      // Remove any % symbols and ensure we pass a clean number
                      const cleanValue = e.target.value.replace(/%/g, "");
                      field.handleChange(Number(cleanValue));
                    }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                    %
                  </span>
                </div>
                <FieldError field={field} />
              </div>
            );
          }}
          name="percent"
        />
      </div>
    </ScrollArea>
  );
}
