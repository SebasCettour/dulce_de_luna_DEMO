import React from "react";

const HeaderLogin: React.FC = () => {
  return (
    <>
      <header
        className="
          fixed top-0 left-0 w-full z-40
          bg-pink-50/95 border-b-2 border-pink-200 shadow-sm
        "
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center sm:justify-start py-3"
        >
          <a
            href="/"
            className="flex flex-row items-center gap-2 sm:gap-3 group"
          >
            <img
              src="/demo-product.svg"
              alt="Tienda natural demo"
              className="h-20 sm:h-16 md:h-16 lg:h-20 transition-all duration-300 hover:scale-105 object-contain"
            />
            <div className="text-left leading-tight">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-pink-700">
                Tienda natural demo
              </h1>
              <p className="text-xs md:text-sm text-pink-700 font-medium">
                Dietética & Vida Saludable
              </p>
            </div>
          </a>
        </div>
      </header>

      <div className="h-28 sm:h-[86px] md:h-[94px] lg:h-[104px]" />
    </>
  );
};

export default HeaderLogin;
