"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  const handleChange = (value: string) => {
    setPending(true);
    router.push(pathname.replace(`/${locale}`, `/${value}`));
    setTimeout(() => setPending(false), 300);
  };

  return (
    <div className="flex items-center">
      <Select value={locale} onValueChange={handleChange} disabled={pending}>
        <SelectTrigger className="w-[130px] bg-transparent border-none focus:ring-0 focus:ring-offset-0">
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("english")}</SelectItem>
          <SelectItem value="pt">{t("portuguese")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
