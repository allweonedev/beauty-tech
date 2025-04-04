"use client";
import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings, HelpCircle } from "lucide-react";
import { UserProfileModal } from "./UserProfileModal";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

interface UserProfileDropdownProps {
  onSettingsClick: () => void;
}

export function UserProfileDropdown({
  onSettingsClick,
}: UserProfileDropdownProps) {
  const t = useTranslations("profile");
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    setShowProfileModal(true);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
  };

  // Extract initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = session?.user?.name
    ? getInitials(session.user.name)
    : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={session?.user?.image ?? ""}
            alt={session?.user?.name ?? "User"}
          />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{session?.user?.name ?? t("user")}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={handleProfileClick}
          >
            <User className="w-4 h-4" />
            {t("myProfile")}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={() => {
              setIsOpen(false);
              onSettingsClick();
            }}
          >
            <Settings className="w-4 h-4" />
            {t("settings")}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={() => {
              setIsOpen(false);
              // Handle help click
            }}
          >
            <HelpCircle className="w-4 h-4" />
            {t("help")}
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </div>
      )}

      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
