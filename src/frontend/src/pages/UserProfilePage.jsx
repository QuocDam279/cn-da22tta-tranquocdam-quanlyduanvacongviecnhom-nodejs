// src/pages/UserProfilePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import ProfileHeader from "../components/profile/ProfileHeader";
import GeneralSettings from "../components/profile/GeneralSettings";
import Header from "../components/common/Header";
import { Loader2, ArrowLeft } from "lucide-react";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { data: profileData, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">Lỗi tải thông tin</p>
            <p className="text-slate-600">{error.message}</p>
          </div>
        </div>
      </>
    );
  }

  const user = profileData?.user;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Nút quay lại */}
          <button
            onClick={() => navigate("/tongquan")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại tổng quan</span>
          </button>

          {/* Header với Avatar */}
          <ProfileHeader user={user} />

          {/* General Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-4">
            <GeneralSettings user={user} />
          </div>
        </div>
      </div>
    </>
  );
}