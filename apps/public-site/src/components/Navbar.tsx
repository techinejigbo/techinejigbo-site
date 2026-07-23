"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Code2 } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Programs', href: '/programs' },
    { name: 'Impact', href: '/impact' },
    { name: 'Gallery', href: '/gallery' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed w-full z-50 glass border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-brand-orange text-white p-2 rounded-lg group-hover:bg-brand-orange-dark transition-colors">
                <Code2 size={24} />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-brand-dark">
                Techin<span className="text-brand-orange">Ejigbo</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                  isActive(item.href) ? 'text-brand-orange' : 'text-slate-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-4">
              <Link
                href="/contact"
                className="text-sm font-medium text-slate-600 hover:text-brand-orange transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/get-involved"
                className="bg-brand-orange text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-orange-dark transition-colors shadow-sm hover:shadow-md"
              >
                Get Involved
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-brand-orange p-2"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-orange-50 text-brand-orange'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-orange'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-orange"
            >
              Contact
            </Link>
            <div className="pt-4 pb-2 px-3 space-y-3">
              <Link
                href="/get-involved"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-brand-orange text-white px-5 py-3 rounded-xl text-base font-semibold hover:bg-brand-orange-dark transition-colors"
              >
                Get Involved
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
