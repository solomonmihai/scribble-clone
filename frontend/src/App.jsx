import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Game from '@/pages/game';
import Landing from '@/pages/Landing';

import AuthStore from "@/stores/Auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/game",
    element: <Game />
  }
]);

export default function App() {
  useEffect(() => {
    const unsubscribe = AuthStore.subscribe(s => s.username, (newUsername) => {
      localStorage.setItem("username", newUsername);
    });

    const localUsername = localStorage.getItem("username");
    if (localUsername) {
      AuthStore.update(s => {
        s.username = localUsername;
      });
    }

    return () => {
      unsubscribe();
    }
  }, []);

  return <RouterProvider router={router}/>
}
