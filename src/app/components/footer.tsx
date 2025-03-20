'use client';

const Footer = () => {
  //set current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <footer className="w-full bg-[#F9FAFB] text-black py-6">
      <div className="max-w-6xl mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} TekJuice. All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;