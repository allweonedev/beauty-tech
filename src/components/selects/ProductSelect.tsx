"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Search,
  Image as ImageIcon,
} from "lucide-react";
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
import { usePaginatedProducts, useProductSearch } from "@/hooks/useProducts";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

interface ProductSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductSelect({
  value,
  onChange,
  placeholder,
  disabled = false,
}: ProductSelectProps) {
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

  // Use the paginated products hook for initial data and infinite scrolling
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPaginated,
  } = usePaginatedProducts(10);

  // Use search hook when search term is provided
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
  } = useProductSearch(debouncedSearchTerm);

  // Determine which data to use based on search term
  const isSearching = debouncedSearchTerm.trim().length > 0;
  const products = isSearching
    ? (searchResults ?? [])
    : (paginatedData?.pages.flatMap((page) => page.data) ?? []);
  const isLoading = isSearching ? isLoadingSearch : isLoadingPaginated;

  // Get selected product if value is provided
  const selectedProduct = value
    ? (products.find((product) => product.id === value) ?? null)
    : null;

  // When the bottom of the list comes into view, load more products (only when not searching)
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isSearching) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage, isSearching]);

  // Handle command input change
  const handleCommandInputChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
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

    if (products.length === 0) {
      return (
        <CommandEmpty>
          {searchTerm
            ? t("common.noResultsFound")
            : t("common.noProductsFound")}
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
          {selectedProduct ? (
            <div className="flex items-center gap-2 truncate">
              {selectedProduct.imageUrl ? (
                <div className="h-6 w-6 relative rounded-sm overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <Avatar className="h-6 w-6 text-xs">
                  <ImageIcon className="h-3 w-3" />
                </Avatar>
              )}
              <span className="truncate">{selectedProduct.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {placeholder ?? t("common.selectProduct")}
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
              placeholder={t("common.searchProducts")}
              value={searchTerm}
              onValueChange={handleCommandInputChange}
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {getEmptyContent() ?? (
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => {
                      onChange(product.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {product.imageUrl ? (
                        <div className="h-8 w-8 relative rounded-sm overflow-hidden flex-shrink-0">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="h-8 w-8 text-xs">
                          <ImageIcon className="h-4 w-4" />
                        </Avatar>
                      )}
                      <div className="flex flex-col truncate">
                        <span className="font-medium truncate">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatPrice(product.price)}</span>
                          <span>•</span>
                          <span>{product.type}</span>
                          {product.category && (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {product.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === product.id ? "opacity-100" : "opacity-0"
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
