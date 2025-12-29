import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, FolderKanban, ListTodo, X } from "lucide-react";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  const { searchTerm, setSearchTerm, searchResults } = useGlobalSearch();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsFocused(false);
    setSearchTerm("");
  };

  return (
    <div className="w-full relative" ref={searchRef}>
      <div className="relative group">
        
        {/* Input Icon Left */}
        <Search 
            size={18} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition duration-200
                ${isFocused ? "text-indigo-500" : "text-indigo-300 group-hover:text-indigo-200"}`} 
        />

        {/* Input Field: Style dark theme mặc định, chuyển sang light khi focus */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Tìm kiếm công việc, dự án..."
          className={`
            w-full py-2 pl-10 pr-10 text-sm rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${isFocused 
                ? "bg-white border-white text-slate-900 placeholder:text-slate-400 shadow-lg" // Khi focus: Nền trắng
                : "bg-indigo-900/50 border-indigo-800 text-indigo-100 placeholder:text-indigo-400 hover:bg-indigo-900/70" // Mặc định: Nền trong suốt
            }
          `}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setIsFocused(true); // Giữ focus sau khi clear
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 transition
                ${isFocused ? "text-slate-400 hover:text-slate-600" : "text-indigo-300 hover:bg-white/20 hover:text-white"}
            `}
          >
            <X size={16} />
          </button>
        )}

        {/* Dropdown Results */}
        {isFocused && searchTerm && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {!searchResults.hasResults ? (
              <div className="p-4 text-slate-500 text-sm text-center">
                Không tìm thấy kết quả cho "{searchTerm}"
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto py-2">
                {searchResults.teams.length > 0 && (
                  <Group title="Nhóm">
                    {searchResults.teams.map((team) => (
                      <Row
                        key={team._id}
                        icon={<Users size={16} className="text-blue-500" />}
                        title={team.team_name}
                        onClick={() => handleNavigate(`/nhom/${team._id}`)}
                      />
                    ))}
                  </Group>
                )}

                {searchResults.projects.length > 0 && (
                  <Group title="Dự án">
                    {searchResults.projects.map((proj) => (
                      <Row
                        key={proj._id}
                        icon={<FolderKanban size={16} className="text-amber-500" />}
                        title={proj.project_name}
                        subtitle={proj.team?.team_name}
                        onClick={() => handleNavigate(`/duan/${proj._id}`)}
                      />
                    ))}
                  </Group>
                )}

                {searchResults.tasks.length > 0 && (
                  <Group title="Công việc">
                    {searchResults.tasks.map((task) => (
                      <Row
                        key={task._id}
                        icon={<ListTodo size={16} className="text-emerald-500" />}
                        title={task.task_name}
                        subtitle={task.status}
                        onClick={() => handleNavigate(`/congviec/${task._id}`)}
                      />
                    ))}
                  </Group>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components giữ nguyên logic nhưng style gọn hơn
function Group({ title, children }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="px-3 py-1.5 bg-slate-50 border-y border-slate-100 sticky top-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ icon, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 cursor-pointer transition-colors group"
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 truncate transition-colors">
          {title}
        </p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}