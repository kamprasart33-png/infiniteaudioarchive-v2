export default function MainLayout({ children }) {
  return (
    <main style={{ margin: "0 auto", maxWidth: "900px" }}>
      {children}
    </main>
  );
}
