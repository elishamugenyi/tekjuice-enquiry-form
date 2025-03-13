'use client';

import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="w-[calc(100%+40px)] -mx-5 bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] py-4 px-4 rounded-md mb-8">
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