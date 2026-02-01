// "use client";
// import React, { useEffect, useRef } from "react";

// const Hero = () => {
//   const heroRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     let animationFrameId: number;
//     const handleScroll = () => {
//       if (heroRef.current) {
//         const scrollPosition = window.scrollY;
//         heroRef.current.style.transform = `translateY(${
//           scrollPosition * 0.2
//         }px)`;
//       }
//       animationFrameId = requestAnimationFrame(handleScroll);
//     };
//     animationFrameId = requestAnimationFrame(handleScroll);
//     return () => cancelAnimationFrame(animationFrameId);
//     // window.addEventListener("scroll", handleScroll);
//     // return () => window.removeEventListener("scroll", handleScroll);
//   }, []);
//   return (
//     <section className="relative h-screen overflow-hidden">
//       <div ref={heroRef} className="absolute inset-0 w-full h-full">
//         <img
//           src="https://plus.unsplash.com/premium_photo-1661425828618-f48a8beb4f6c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//           loading="lazy"
//           alt="hero background"
//           className="w-full h-full object-cover z-0"
//         />
//       </div>
//       <div className="absolute inset-0 bg-gray-900 opacity-30"></div>
//       <div className="container mx-auto px-4 md:px-8 h-full flex flex-col justify-center relative z-10">
//         <div className="max-w-xl">
//           <h1 className="text-4xl md:text-6xl font-serif text-white font-bold leading-tight mb-4">
//             Crafted for <br />
//             <span className="text-amber-400">Excellence</span>
//           </h1>
//           <p className="text-lg text-white mb-8 max-w-md">
//             Discover our collection of meticulously tailored suits designed for
//             the modern gentleman.
//           </p>
//           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//             <button className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-8 transition-colors duration-300">
//               Shop Collection
//             </button>
//             <button className="border border-white text-white hover:bg-white hover:text-gray-900 font-medium py-3 px-8 transition-colors duration-300">
//               Book Appointment
//             </button>
//           </div>
//         </div>
//       </div>
//       <div className="absolute bottom-8 left-0 right-0 flex justify-center">
//         <div className="animate-bounce">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6 text-white"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M19 14l-7 7m0 0l-7-7m7 7V3"
//             />
//           </svg>
//         </div>
//       </div>
//     </section>
//   );
// };
// export default Hero;

"use client";
import { ArrowRightIcon, ChevronRightIcon, Image } from "lucide-react";
import React from "react";
import CategoriesMarquee from "./customize/CategoriesMarquee";

function Hero() {
  return (
    <div className="pt-36 px-4 md:px-8">
      <div className="flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10">
        <div className="relative flex-1 flex flex-col bg-green-200 rounded-3xl xl:min-h-100 group ">
          {/* background image*/}
          <img
            src="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 opacity-90 group-hover:opacity-100"
            alt=""
          />
          {/* overlay  */}
          <div className="absolute inset-0 bg-black/20 z-0 rounded-3xl"></div>
          <div className="relative z-10 p-5 sm:p-16 text-left">
            <div className="inline-flex items-center gap-3 bg-gray-300 text-gray-600 pr-4 p-1 rounded-full text-xs sm:text-sm">
              <span className="bg-gray-800 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs">
                NEWS
              </span>
              Free Shipping on Orders Above $5000!
              <ChevronRightIcon
                className="group-hover:ml-2 transition-all"
                size={16}
              />
            </div>
            <h2 className="text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-linear-to-r from-slate-600 to-amber-400 bg-clip-text text-transparent max-w-xs  sm:max-w-md">
              Elavate Your Excellence.
            </h2>
            <div className="text-slate-800 text-sm font-medium mt-4 sm:mt-8">
              {/* <p className="text-white">Starts from</p>
              <p className="text-3xl">4.90</p> */}
            </div>
            <button className="bg-amber-500 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-lg hover:bg-amber-600 hover:scale-103 active:scale-95 transition">
              LEARN MORE
            </button>
          </div>
          <img
            className="absolute inset-0 w-full h-full object-cover z-0 rounded-3xl opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            src={`https://plus.unsplash.com/premium_photo-1661425828618-f48a8beb4f6c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
            alt=""
          />
        </div>
        <div className="flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600">
          <div className="flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group">
            <div>
              <p className="text-3xl font-medium bg-linear-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40">
                Most Popular
              </p>
              <p className="flex items-center gap-1 mt-4 hover:text-amber-500">
                View more
                <ArrowRightIcon
                  className="group-hover:ml-2 transition-all"
                  size={18}
                />
              </p>
            </div>
            <img
              className="w-35 object-cover"
              src={`https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80`}
            />
          </div>
          <div className="flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group">
            <div>
              <p className="text-3xl font-medium bg-linear-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40">
                20% discounts
              </p>
              <p className="flex items-center gap-1 mt-4 hover:text-amber-500">
                View more
                <ArrowRightIcon
                  className="group-hover:ml-2 transition-all"
                  size={18}
                />
              </p>
            </div>
            <img
              className="w-35"
              src={`https://images.unsplash.com/photo-1521334884684-d80222895322?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80`}
            />
          </div>
        </div>
      </div>
      <CategoriesMarquee />
    </div>
  );
}

export default Hero;
