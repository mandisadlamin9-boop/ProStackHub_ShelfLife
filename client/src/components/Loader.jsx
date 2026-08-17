export default function Loader({ label = "Loading" }) {
  return (
    <div className="book-loader" role="status" aria-label={label}>
      <div className="book-loader-scene">
        <div className="book-loader-base" />
        <div className="book-loader-spine" />
        <div className="book-loader-page" />
      </div>
      {label && <span className="book-loader-label">{label}</span>}
    </div>
  );
}
