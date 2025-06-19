import { IconSearch, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "w-64",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9 pr-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      {value && (
        <Button
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          size="icon"
          variant="ghost"
          onClick={onClear}
        >
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
