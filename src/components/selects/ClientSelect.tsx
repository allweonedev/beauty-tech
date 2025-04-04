"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePaginatedClients, useClientSearch } from "@/hooks/useClients";
import { Avatar } from "@/components/ui/avatar";
import { useInView } from "react-intersection-observer";
import type { Client } from "@/types/client";

interface ClientSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ClientSelect({
  value,
  onChange,
  placeholder,
  disabled = false,
}: ClientSelectProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { ref, inView } = useInView();

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Use the paginated clients hook for initial data and infinite scrolling
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPaginated,
  } = usePaginatedClients(10);

  // Use search hook when search term is provided
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
  } = useClientSearch(debouncedSearchTerm);

  // Determine which data to use based on search term
  const isSearching = debouncedSearchTerm.trim().length > 0;
  const clients: Client[] = isSearching
    ? (searchResults ?? [])
    : (paginatedData?.pages.flatMap((page) => page.data) ?? []);
  const isLoading = isSearching ? isLoadingSearch : isLoadingPaginated;

  // Get selected client if value is provided
  const selectedClient = value
    ? (clients.find((client) => client.id === value) ?? null)
    : null;

  // When the bottom of the list comes into view, load more clients (only when not searching)
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isSearching) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage, isSearching]);

  // Handle command input change
  const handleCommandInputChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Get the first letter of the client name for the avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Status to show (loading, error, or no results)
  const getEmptyContent = () => {
    if (isLoading) {
      return (
        <div className="py-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">
            {t("common.loading")}
          </p>
        </div>
      );
    }

    if (isErrorSearch) {
      return (
        <div className="py-6 text-center">
          <p className="text-sm text-destructive">
            {t("common.errorLoadingData")}
          </p>
        </div>
      );
    }

    if (clients.length === 0) {
      return (
        <CommandEmpty>
          {searchTerm ? t("common.noResultsFound") : t("common.noClientsFound")}
        </CommandEmpty>
      );
    }

    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden"
          disabled={disabled}
        >
          {selectedClient ? (
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-6 w-6 text-xs">
                {getInitials(selectedClient.name)}
              </Avatar>
              <span className="truncate">{selectedClient.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {placeholder ?? t("common.selectClient")}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[300px]">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
            <CommandInput
              placeholder={t("common.searchClients")}
              value={searchTerm}
              onValueChange={handleCommandInputChange}
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {getEmptyContent() ?? (
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id}
                    onSelect={() => {
                      onChange(client.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-6 w-6 text-xs">
                        {getInitials(client.name)}
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span className="font-medium truncate">
                          {client.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {client.email ?? ""}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
                {hasNextPage && !isSearching && (
                  <div ref={ref} className="py-2 text-center">
                    {isFetchingNextPage && (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                    )}
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
