export function FooterSection() {
  return (
    <footer className="py-12 sm:py-16 px-6">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm font-bold text-white/30">THREE</span>
        <p className="text-xs text-white/15">
          &copy; {new Date().getFullYear()} 363™. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
