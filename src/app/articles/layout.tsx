export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col max-w-2xl items-center w-full mx-auto">
      {children}
    </div>
  );
}
