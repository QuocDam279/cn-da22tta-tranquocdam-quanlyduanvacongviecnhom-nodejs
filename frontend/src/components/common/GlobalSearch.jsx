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
    <div className="flex-1 flex justify-center relative" ref={searchRef}>
      <div className="relative w-full max-w-xl">
        
        {/* Input Search đơn giản */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Tìm kiếm..."
          className="pl-10 pr-10 py-1.5 rounded-full border border-slate-300 bg-white text-sm w-full focus:outline-none"
        />
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setIsFocused(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          >
            <X size={16} />
          </button>
        )}

        {/* Dropdown gọn nhẹ */}
        {isFocused && searchTerm && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-sm">
            {!searchResults.hasResults ? (
              <div className="p-3 text-gray-500 text-sm text-center">
                Không có kết quả cho "{searchTerm}"
              </div>
            ) : (
              <>
                {searchResults.teams.length > 0 && (
                  <Group title="Nhóm">
                    {searchResults.teams.map((team) => (
                      <Row
                        key={team._id}
                        icon={<Users size={16} />}
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
                        icon={<FolderKanban size={16} />}
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
                        icon={<ListTodo size={16} />}
                        title={task.task_name}
                        subtitle={task.status}
                        onClick={() => handleNavigate(`/congviec/${task._id}`)}
                      />
                    ))}
                  </Group>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div className="border-t border-slate-200 px-2 py-1">
      <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
      {children}
    </div>
  );
}

function Row({ icon, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
    >
      <div className="w-6 h-6 text-slate-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
