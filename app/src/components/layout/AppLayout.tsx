import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, HomeIcon, ClipboardDocumentListIcon, CalendarIcon, DocumentTextIcon, CircleStackIcon, SunIcon, MoonIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Link, Outlet, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Analitik", href: "/analytics", icon: ChartBarIcon },
  { name: "Rekap Menu", href: "/overview", icon: CalendarIcon },
  { name: "Input Menu", href: "/input", icon: ClipboardDocumentListIcon },
  { name: "Laporan Harian", href: "/reports/daily", icon: DocumentTextIcon },
  { name: "Master Data", href: "/master", icon: CircleStackIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Lazy initialize dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage (client side only)
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme !== "light"; // Default to dark unless explicitly light
    }
    return true;
  });

  // Sync Theme with DOM
  useEffect(() => {
    console.log("Theme Effect Triggered. DarkMode:", darkMode); // DEBUG
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Toggle Theme Function
  const toggleTheme = () => {
    console.log("Toggling theme. Current:", darkMode, "Next:", !darkMode); // DEBUG
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/* Mobile Sidebar Dialog */}
        <Transition show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <TransitionChild as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-900/80" />
            </TransitionChild>

            <div className="fixed inset-0 flex">
              <TransitionChild
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <TransitionChild as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </TransitionChild>

                  {/* Mobile Sidebar Content */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4 ring-1 ring-gray-900/10 dark:ring-white/10 transition-colors duration-300">
                    <div className="flex h-16 shrink-0 items-center">
                      <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-lg" />
                      <span className="ml-3 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Nutri Infinita</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    location.pathname === item.href
                                      ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                                      : "text-gray-700 dark:text-gray-400 hover:text-green-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200"
                                  )}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900/50 dark:backdrop-blur-xl px-6 pb-4 transition-colors duration-300">
            <div className="flex h-16 shrink-0 items-center">
              <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-lg" />
              <span className="ml-3 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Nutri Infinita</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            location.pathname === item.href
                              ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-l-4 border-green-500"
                              : "text-gray-700 dark:text-gray-400 hover:text-green-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-transparent",
                            "group flex gap-x-3 rounded-r-md p-2 text-sm leading-6 font-semibold transition-all duration-200"
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-white/5 py-6">
              <div className="px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 dark:text-gray-500">© 2026 Nutri Infinita. Code by Ns.Hidayatullah.</div>
            </footer>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:pl-72">
          {/* Top Header/Navbar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-colors duration-300">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-400 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5 text-gray-600" />}
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-white/10" aria-hidden="true" />

              {/* User Profile (Static for now) */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <span className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Admin</span>
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-gray-800">A</div>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
