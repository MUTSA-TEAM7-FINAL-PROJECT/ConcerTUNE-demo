import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="w-full bg-gray-800 p-4 text-center text-white">
        © ConcerTUNE. All rights reserved.
      </footer>
    </div>
  );
};
export default MainLayout;