import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, HomeIcon, ClipboardDocumentListIcon, FolderIcon, ChartBarIcon, DocumentTextIcon, ChevronDownIcon, UserCircleIcon, CalendarIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Rekap Menu", href: "/overview", icon: CalendarIcon },
  { name: "Laporan Harian", href: "/reports/daily", icon: DocumentTextIcon }, // New
  { name: "Input Menu", href: "/input", icon: ClipboardDocumentListIcon },
  { name: "Data Master", href: "/master", icon: FolderIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  // { name: "Laporan", href: "/reports", icon: DocumentTextIcon }, // Remove generic Laporan
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navigation.find((item) => item.href === location.pathname)?.name || "Catering Nutrition";

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-green-500/10 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      {/* Mobile sidebar */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300 ease-linear data-[closed]:opacity-0" />

        <div className="fixed inset-0 flex">
          <DialogPanel transition className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full">
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            {/* Mobile Sidebar Content */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/90 backdrop-blur-xl px-6 pb-4 ring-1 ring-white/10">
              <div className="flex h-16 shrink-0 items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">∞</span>
                </div>
                <span className="ml-3 text-xl font-bold tracking-tight text-white">Nutri Infinita</span>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                isActive ? "bg-green-500/20 text-white shadow-sm ring-1 ring-inset ring-green-500/30" : "text-gray-400 hover:bg-white/5 hover:text-white",
                                "group flex gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 transition-all"
                              )}
                            >
                              <item.icon aria-hidden="true" className={classNames(isActive ? "text-green-400" : "text-gray-400 group-hover:text-white", "h-6 w-6 shrink-0")} />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-white/5 bg-gray-900/50 backdrop-blur-xl px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">∞</span>
            </div>
            <span className="ml-3 text-xl font-bold tracking-tight text-white">Nutri Infinita</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            isActive ? "bg-green-500/20 text-white shadow-lg shadow-green-500/10 ring-1 ring-inset ring-green-500/30" : "text-gray-400 hover:bg-white/5 hover:text-white",
                            "group flex gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 transition-all duration-200"
                          )}
                        >
                          <item.icon aria-hidden="true" className={classNames(isActive ? "text-green-400" : "text-gray-400 group-hover:text-white", "h-6 w-6 shrink-0 transition-colors")} />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 relative z-10">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-white lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>

          <div aria-hidden="true" className="h-6 w-px bg-white/10 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-white">{currentPage}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-x-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-white/10">
                    <UserCircleIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span aria-hidden="true" className="text-sm font-semibold text-white ml-2">
                      Admin Gizi
                    </span>
                    <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-gray-800 py-2 shadow-lg ring-1 ring-white/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
                >
                  <MenuItem>
                    <div className="block px-3 py-2 text-sm text-gray-400 border-b border-white/5">admin@gizi.com</div>
                  </MenuItem>
                  <MenuItem>
                    <button className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300">Keluar</button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6">
          <div className="px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">© 2026 Nutri Infinita. Code by Ns.Hidayatullah.</div>
        </footer>
      </div>
    </div>
  );
}
