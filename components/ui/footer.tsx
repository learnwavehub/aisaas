export default function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-6 py-12 text-sm text-zinc-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} Magic Ai — Built with Eng Daniel</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
