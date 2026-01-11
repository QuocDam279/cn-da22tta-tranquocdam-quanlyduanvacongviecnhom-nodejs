import React from "react";
import UserAvatar from "../common/UserAvatar";
import { Sparkles, Shield, Award } from "lucide-react";

export default function ProfileHeader({ user }) {

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-10 right-10 opacity-20">
        <Sparkles className="w-8 h-8 text-white animate-pulse" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-20">
        <Sparkles className="w-6 h-6 text-white animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with glow effect */}
          <div className="relative group">
            <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative">
              <UserAvatar 
                user={user}
                className="w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl text-2xl backdrop-blur-sm"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-2 border-4 border-white/30 shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {user?.full_name}
              </h1>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Shield className="w-4 h-4 text-white inline" />
              </div>
            </div>
            
            <p className="text-white/90 text-lg mb-4 font-medium">{user?.email}</p>
            
            <div className="flex items-center justify-center sm:justify-start gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-white/80">Tham gia </span>
                <span className="text-white font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}