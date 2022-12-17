import React from "react";
import { Redirect } from "react-router-dom";

//pages
import DashboardAnalytics from "../pages/DashboardAnalytics";
import Posts from "../pages/Posts";
import HandlePost from "../pages/Posts/HandlePost";
import Tags from "../pages/Tags";
import categories from "../pages/Categories";
import Menus from "../pages/Menus";
import ShortCodes from "../pages/ShortCodes";
//login
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Banners from "../pages/Banners";
import Users from "../pages/Authentication/Users";
import Roles from "../pages/Authentication/Role";
import Actions from "../pages/Authentication/Action";
import RoleActions from "../pages/Authentication/RoleAction";
import SchemasActions from "../pages/Schemas";
import Feedbacks from "../pages/Feedbacks";
import UploadImages from "../pages/UploadImages";
const authProtectedRoutes = [
  { path: "/dashboard-analytics", component: DashboardAnalytics },
  { path: "/posts", component: Posts },
  { path: "/post/:id", component: HandlePost },
  { path: "/post", component: HandlePost },
  { path: "/tags", component: Tags },
  { path: "/categories", component: categories },
  { path: "/menus", component: Menus },
  { path: "/shortcodes", component: ShortCodes },
  { path: "/banners", component: Banners },
  { path: "/users", component: Users },
  { path: "/roles", component: Roles },
  { path: "/actions", component: Actions },
  { path: "/roleActions", component: RoleActions },
  { path: "/schemas", component: SchemasActions },
  { path: "/feedbacks", component: Feedbacks },
  { path: "/uploadImages", component: UploadImages },

  {
    path: "/",
    exact: true,
    component: () => <Redirect to="/dashboard" />,
  },
];

const publicRoutes = [
  // Authentication Page
  { path: "/login", component: Login },
  { path: "/logout", component: Logout },
];

export { authProtectedRoutes, publicRoutes };
