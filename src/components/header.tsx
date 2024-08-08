"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { IoCartOutline } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSelector } from "react-redux";
import { RootState } from "@/store/strore";

import { FiAlignRight } from "react-icons/fi";

const Navbar = () => {
  const totalQuantity = useSelector(
    (state: RootState) => state.cartSlice.totalQuantity,
  );
  return (
    <header className="flex justify-evenly items-center p-7 bg-gray-100 border ">
      <Link href={"/"}>
        <Image
          src="/Logo.webp"
          width={140}
          height={140}
          alt="Logo"
          className="cursor-pointer"
        />
      </Link>

      <Link href={"/female"} className="hidden sm:block">
        Female
      </Link>
      <Link href={"/male"} className="hidden sm:block">
        Male
      </Link>
      {/* <Link href={"/kid"} className="hidden sm:block">
        Kid
      </Link> */}

      <Input
        className="w-30 h-6 hidden sm:block"
        placeholder="Type here to search..."
        type="text"
      />
      <Link href="/cart" className="hidden sm:block relative">
        <div className="relative">
          <IoCartOutline
            size={30}
            className="ring-2 ring-gray-300 rounded-full"
          />
          {totalQuantity > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
              {totalQuantity}
            </span>
          )}
        </div>
      </Link>
      <Sheet>
        <SheetTrigger className="lg:hidden">
          <FiAlignRight />
        </SheetTrigger>
        <SheetContent className="flex flex-col p-20 lg:hidden">
          <Link href={"/female"}>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              <SheetTrigger>Female</SheetTrigger>
            </h4>
          </Link>
          <Link href={"/male"}>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              <SheetTrigger>Male </SheetTrigger>
            </h4>
          </Link>
          <Link href={"/kid"}>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              <SheetTrigger>Kid</SheetTrigger>
            </h4>
          </Link>
          <Link href="/cart" className="hidden sm:block relative">
            <div className="relative">
              <IoCartOutline
                size={30}
                className="ring-2 ring-gray-300 rounded-full"
              />
              {totalQuantity > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                  {totalQuantity}
                </span>
              )}
            </div>
          </Link>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
