
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  [key: string]: any; // Allow other properties like 'phone'
}

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: React.Dispatch<React.SetStateAction<Option[]>>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: Option) => {
    onChange(selected.filter((i) => i.value !== item.value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${
            selected.length > 1 ? "h-full" : "h-10"
          }`}
          onClick={() => setOpen(!open)}
          disabled={props.disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span>{placeholder}</span>}
            {selected.length === options.length && options.length > 0 ? (
                <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                >
                   All users
                </Badge>
            ) : selected.map((item) => (
              <Badge
                variant="secondary"
                key={item.value}
                className="rounded-sm px-1 font-normal"
                onClick={(e) => {
                    e.stopPropagation(); // prevent popover from opening
                    handleUnselect(item)
                }}
              >
                {item.label}
                <X className="ml-1 h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
            
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className={className}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
               <CommandItem
                onSelect={() => {
                  if (selected.length === options.length) {
                    onChange([])
                  } else {
                    onChange(options)
                  }
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selected.length === options.length
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <Check className={cn("h-4 w-4")} />
                </div>
                <span>Select All</span>
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      selected.some((item) => item.value === option.value)
                        ? selected.filter((item) => item.value !== option.value)
                        : [...selected, option]
                    )
                    setOpen(true)
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.some((item) => item.value === option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  {option.icon && (
                    <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect };
