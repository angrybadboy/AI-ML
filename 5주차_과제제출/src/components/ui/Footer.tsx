export default function Footer() {
  return (
    <footer className="border-t border-gray-200/80 bg-white py-6">
      <div className="mx-auto max-w-5xl px-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} NeuroLab &middot; 부산대학교
        AI머신러닝 프로젝트
      </div>
    </footer>
  );
}
