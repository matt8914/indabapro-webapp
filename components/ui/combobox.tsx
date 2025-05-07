"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  onSearch?: (value: string) => void
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  onSearch,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)

  // Get current selected option label
  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)?.label || ""
  }, [options, value])

  // Handle search value changes with debounce
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
    setIsSearching(true);
    
    // Call onSearch prop if provided
    if (onSearch) {
      onSearch(value);
      
      // Reset searching state after a brief delay
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  }, [onSearch]);

  // Auto-open dropdown when typing
  React.useEffect(() => {
    if (searchValue.length > 0 && !open) {
      setOpen(true);
    }
  }, [searchValue, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          onClick={() => {
            if (!open) {
              setOpen(true);
              // Refresh search when reopening
              if (searchValue && onSearch) {
                onSearch(searchValue);
              }
            }
          }}
        >
          {value ? selectedOption : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={handleSearchChange}
            className="h-9"
          />
          
          {isSearching && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}
          
          {!isSearching && searchValue.length < 2 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}
          
          {!isSearching && searchValue.length >= 2 && options.length === 0 && (
            <div className="px-2 py-4 text-center">
              <p className="text-sm text-muted-foreground">No schools found with that name</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
            </div>
          )}
          
          {!isSearching && options.length > 0 && (
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {options.map((option) => (
                <div 
                  key={option.value}
                  className="cursor-pointer px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                  onClick={() => {
                    onChange(option.value);
                    setSearchValue("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
} 