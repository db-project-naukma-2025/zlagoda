import { type AnyFieldApi } from "@tanstack/react-form";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { FieldError } from "@/components/common/field-error";
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
                <Label htmlFor={field.name}>Employee ID</Label>
                <Input
                  id={field.name}
                  maxLength={10}
                  name={field.name}
                  placeholder="Enter employee ID (10 characters)"
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
                <Label htmlFor={field.name}>Surname</Label>
                <Input
                  id={field.name}
                  maxLength={50}
                  name={field.name}
                  placeholder="Enter surname"
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
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  maxLength={50}
                  name={field.name}
                  placeholder="Enter name"
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
                placeholder="Enter patronymic"
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
              <Label htmlFor={field.name}>Role</Label>
              <Combobox
                className="w-full"
                emptyMessage="No roles found."
                options={[
                  { value: "cashier", label: "Cashier" },
                  { value: "manager", label: "Manager" },
                ]}
                placeholder="Select a role"
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
              <Label htmlFor={field.name}>Salary</Label>
              <Input
                id={field.name}
                min="0"
                name={field.name}
                placeholder="Enter salary"
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
                <Label htmlFor={field.name}>Date of Birth</Label>
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
                <Label htmlFor={field.name}>Date of Start</Label>
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
          )}
          name="phone_number"
        />

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>City</Label>
                <Input
                  id={field.name}
                  maxLength={50}
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
            )}
            name="city"
          />

          <form.Field
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Street</Label>
                <Input
                  id={field.name}
                  maxLength={50}
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
            )}
            name="street"
          />
        </div>

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>ZIP Code</Label>
              <Input
                id={field.name}
                maxLength={9}
                name={field.name}
                placeholder="Enter ZIP code (5-9 characters)"
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
