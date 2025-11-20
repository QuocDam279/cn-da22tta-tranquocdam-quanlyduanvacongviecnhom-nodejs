// frontend/src/components/common/Button.jsx
export default function Button({ children, loading, ...props }) {
  return (
    <button {...props} disabled={loading} className="login-btn">
      {loading ? (
        <>
          {/* Thêm phần tử HTML cho Spinner */}
          <span className="button-spinner"></span> 
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}