import Image from "next/image";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-8">
        <Image
          src="/images/indabapro logo.png"
          alt="IndabaPro Logo"
          width={180}
          height={75}
          priority
        />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
}
