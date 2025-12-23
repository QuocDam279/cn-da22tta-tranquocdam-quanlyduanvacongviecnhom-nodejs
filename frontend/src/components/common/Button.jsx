// src/components/common/Button.jsx

export default function Button({ children, loading, ...props }) {
  return (
    <button 
      {...props} 
      disabled={loading} 
      className="w-full bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}