'use client';

import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="w-full fixed top-0 bg-white py-4 shadow-sm z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex-shrink-0">
          <Image
            src="/logo.png"
            width={200}
            height={200}
            alt="Tek Juice"
            className="object-contain"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;