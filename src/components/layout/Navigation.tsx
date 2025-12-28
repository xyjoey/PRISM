'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SiteConfig } from '@/lib/config';
import Image from 'next/image';  // 引入 Image 组件

interface NavigationProps {
  items: SiteConfig['navigation'];
  siteTitle: string;
  enableOnePageMode?: boolean;
}

export default function Navigation({ items, siteTitle, enableOnePageMode }: NavigationProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (enableOnePageMode) {
      // Set initial hash on client-side to avoid hydration mismatch
      setActiveHash(window.location.hash);
      const handleHashChange = () => setActiveHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);

      // Scroll Spy Logic
      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Update active hash based on intersecting section
            const id = entry.target.id;
            setActiveHash(id === 'about' ? '' : `#${id}`);
          }
        });
      };

      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Adjust these margins to trigger when section is roughly in view
        threshold: 0
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);

      // Observe all sections
      items.forEach(item => {
        if (item.type === 'page') {
          const element = document.getElementById(item.target);
          if (element) observer.observe(element);
        }
      });

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        observer.disconnect();
      };
    }
  }, [enableOnePageMode, items]);

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50">
      {({ open }) => (
        <>
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
              'transition-all duration-300 ease-out',
              scrolled
                ? 'bg-background/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg'
                : 'bg-transparent'
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 lg:h-20">
                {/* Logo/Name */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href="/"
                    className="flex items-center space-x-3 text-xl lg:text-2xl font-serif font-semibold text-primary hover:text-accent transition-colors duration-200"
                  >
                    {/* Logo Image */}
                    <div className="bg-transparent p-1 rounded-md">
                      {/* Light mode logo */}
                      <Image
                        src="/zzu.svg"
                        alt="Logo"
                        width={120}
                        height={35}
                        className="object-contain block dark:hidden"
                      />

                      {/* Dark mode logo */}
                      <Image
                        src="/zzu_white.svg"
                        alt="Logo (dark)"
                        width={120}
                        height={35}
                        className="object-contain hidden dark:block"
                      />
                    </div>
                    <span className="text-neutral-300 dark:text-neutral-600">|</span>
                    <span>{siteTitle}</span>
                  </Link>
                </motion.div>

                {/* Desktop Navigation */}
                <div className="hidden lg:block">
                  <div className="ml-10 flex items-center space-x-8">
                    <div className="flex items-baseline space-x-8">
                      {items.map((item) => {
                        const isActive = enableOnePageMode
                          ? activeHash === `#${item.target}` || (!activeHash && item.target === 'about')
                          : (item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href));

                        const href = enableOnePageMode
                          ? `/#${item.target}`
                          : item.href;

                        return (
                          <Link
                            key={item.title}
                            href={href}
                            prefetch={true}
                            onClick={() => enableOnePageMode && setActiveHash(`#${item.target}`)}
                            className={cn(
                              'relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm',
                              isActive
                                ? 'text-primary'
                                : 'text-neutral-600 hover:text-primary'
                            )}
                          >
                            <span className="relative z-10">{item.title}</span>
                            {isActive && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-accent/10 rounded-lg"
                                initial={false}
                                transition={{
                                  type: 'spring',
                                  stiffness: 500,
                                  damping: 30
                                }}
                              />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                {/* Mobile menu button and theme toggle */}
                <div className="lg:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent transition-colors duration-200">
                    <span className="sr-only">Open main menu</span>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </motion.div>
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {open && (
              <Disclosure.Panel static>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {items.map((item, index) => {
                      const isActive = enableOnePageMode
                        ? (item.href === '/' ? pathname === '/' && !activeHash : activeHash === `#${item.target}`)
                        : (item.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(item.href));

                      const href = enableOnePageMode
                        ? (item.href === '/' ? '/' : `/#${item.target}`)
                        : item.href;

                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Disclosure.Button
                            as={Link}
                            href={href}
                            prefetch={true}
                            onClick={() => enableOnePageMode && setActiveHash(item.href === '/' ? '' : `#${item.target}`)}
                            className={cn(
                              'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                              isActive
                                ? 'text-primary bg-accent/10 border-l-4 border-accent'
                                : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                            )}
                          >
                            {item.title}
                          </Disclosure.Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}