import React from "react";
import { Github, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-indigo-900 bg-indigo-950">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">

        {/* LEFT */}
        <div className="text-indigo-300 flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-400" />
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white">
              Hệ thống quản lý dự án và công việc nhóm
            </span>
          </span>
        </div>

        {/* CENTER */}
        <div className="text-indigo-400 text-xs text-center">
          Xây dựng bằng React · NodeJS · MongoDB · Microservices
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/QuocDam279/HeThongQuanLyDuAnVaCongViecNhom"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-white transition"
            title="GitHub Repository"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
