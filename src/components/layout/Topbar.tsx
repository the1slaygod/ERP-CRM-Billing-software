import { Bell, Search, Plus } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search global (leads, customers, invoices...)"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <Plus className="h-4 w-4" />
          Quick Create
        </button>
        <button className="relative p-2 text-gray-400 hover:text-gray-500">
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500"></span>
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
          U
        </div>
      </div>
    </header>
  );
}
