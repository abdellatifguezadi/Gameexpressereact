import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router";

  import React from "react";
  import ReactDOM from "react-dom/client";
import Login from "../components/Login";
import Master from "../Layout/Master";
import Register from "../components/Register";


  export const router = createBrowserRouter([
    {
      path: "/",
      element: <Master></Master>, children :[
        { path: "/", element: <h3>HOME</h3> },
      ]
    },
    {
        path: "/login",
        element: <Login></Login>,
    },
    {
        path: "/register",
        element: <Register ></Register>,
    },

    
 
  ]);