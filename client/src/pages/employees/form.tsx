import { type AnyFieldApi } from "@tanstack/react-form";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { FieldError } from "@/components/common/field-error";
import { RequiredIndicator } from "@/components/common/required-indicator";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmployeeFormFieldsProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  isCreate?: boolean;
}

export function EmployeeFormFields({
  form,
  isCreate = false,
}: EmployeeFormFieldsProps) {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4 mr-4 ml-4 pb-4">
        {isCreate && (
          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Employee ID <RequiredIndicator />
                </Label>
                <Input
                  id={field.name}
                  maxLength={10}
                  name={field.name}
                  placeholder="e.g., EMP0001234"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            )}
            name="id_employee"
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Surname <RequiredIndicator />
                </Label>
                <Input
                  id={field.name}
                  maxLength={50}
                  name={field.name}
                  placeholder="e.g., Petrenko"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            )}
            name="empl_surname"
          />

          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Name <RequiredIndicator />
                </Label>
                <Input
                  id={field.name}
                  maxLength={50}
                  name={field.name}
                  placeholder="e.g., Oleksandr"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            )}
            name="empl_name"
          />
        </div>

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Patronymic (Optional)</Label>
              <Input
                id={field.name}
                maxLength={50}
                name={field.name}
                placeholder="e.g., Ivanovich (optional)"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value || null);
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="empl_patronymic"
        />

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Role <RequiredIndicator />
              </Label>
              <Combobox
                className="w-full"
                emptyMessage="No roles found."
                options={[
                  { value: "cashier", label: "Cashier" },
                  { value: "manager", label: "Manager" },
                ]}
                placeholder="e.g., Cashier"
                searchPlaceholder="Search roles..."
                value={field.state.value as string}
                onValueChange={(value) => {
                  field.handleChange(value as "cashier" | "manager");
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="empl_role"
        />

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Salary <RequiredIndicator />
              </Label>
              <Input
                id={field.name}
                min="0"
                name={field.name}
                placeholder="e.g., 25000.00"
                step="0.01"
                type="number"
                value={String(field.state.value ?? "")}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(
                    e.target.value ? Number(e.target.value) : 0,
                  );
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="salary"
        />

        <form.Field
          children={(field) => {
            const date = field.state.value
              ? parse(field.state.value as string, "yyyy-MM-dd", new Date())
              : undefined;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Date of Birth <RequiredIndicator />
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={
                        !date
                          ? "text-muted-foreground w-full justify-start"
                          : "w-full justify-start"
                      }
                      variant="outline"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      captionLayout="dropdown"
                      mode="single"
                      selected={date}
                      onSelect={(selected) => {
                        field.handleChange(
                          selected ? format(selected, "yyyy-MM-dd") : "",
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError field={field} />
              </div>
            );
          }}
          name="date_of_birth"
        />

        <form.Field
          children={(field) => {
            const date = field.state.value
              ? parse(field.state.value as string, "yyyy-MM-dd", new Date())
              : undefined;
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Date of Start <RequiredIndicator />
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={
                        !date
                          ? "text-muted-foreground w-full justify-start"
                          : "w-full justify-start"
                      }
                      variant="outline"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      captionLayout="dropdown"
                      mode="single"
                      selected={date}
                      onSelect={(selected) => {
                        field.handleChange(
                          selected ? format(selected, "yyyy-MM-dd") : "",
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError field={field} />
              </div>
            );
          }}
          name="date_of_start"
        />

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Phone Number <RequiredIndicator />
              </Label>
              <PhoneInput
                id={field.name}
                international={true}
                name={field.name}
                placeholder="e.g., +380501234567"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(value) => {
                  field.handleChange(value);
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="phone_number"
        />

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  City <RequiredIndicator />
                </Label>
                <Input
                  id={field.name}
                  maxLength={50}
                  name={field.name}
                  placeholder="e.g., Kyiv"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            )}
            name="city"
          />

          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Street <RequiredIndicator />
                </Label>
                <Input
                  id={field.name}
                  maxLength={50}
                  name={field.name}
                  placeholder="e.g., 10 Khreshchatyk Street"
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldError field={field} />
              </div>
            )}
            name="street"
          />
        </div>

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                ZIP Code <RequiredIndicator />
              </Label>
              <Input
                id={field.name}
                maxLength={9}
                name={field.name}
                placeholder="e.g., 01001"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="zip_code"
        />
      </div>
    </ScrollArea>
  );
}
