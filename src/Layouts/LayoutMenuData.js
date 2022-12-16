import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const Navdata = () => {
  const history = useHistory();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isPosts, setIsPost] = useState(false);
  const [isMenus, setIsMenu] = useState(false);
  const [isShortCodes, setShortCode] = useState(false);
  const [isBanners, setBanners] = useState(false);
  const [isSchema, setIsSchema] = useState(false);
  const [isAuthentications, setAuthentications] = useState(false);

  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Posts") {
      setIsPost(false);
    }
    if (iscurrentState !== "Menus") {
      setIsMenu(false);
    }
  }, [history, iscurrentState, isDashboard, isPosts, isMenus]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isDashboard,
      click: function (e) {
        e.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("Dashboard");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "analytics",
          label: "Analytics",
          link: "/dashboard-analytics",
          parentId: "dashboard",
        },
      ],
    },
    {
      id: "posts",
      label: "Posts",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isPosts,
      click: function (e) {
        e.preventDefault();
        setIsPost(!isPosts);
        setIscurrentState("Posts");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "posts",
          label: "Posts",
          link: "/posts",
          parentId: "posts",
        },
        // {
        //   id: "categories",
        //   label: "Categories",
        //   link: "/categories",
        //   parentId: "posts",
        // },
        {
          id: "tags",
          label: "Tags",
          link: "/tags",
          parentId: "post",
        },
      ],
    },
    {
      id: "menus",
      label: "Menus",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isMenus,
      click: function (e) {
        e.preventDefault();
        setIsMenu(!isMenus);
        setIscurrentState("Menus");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "menus",
          label: "Menus",
          link: "/menus",
          parentId: "post",
        },
      ],
    },
    {
      id: "shortCodes",
      label: "ShortCodes",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isShortCodes,
      click: function (e) {
        e.preventDefault();
        setShortCode(!isShortCodes);
        setIscurrentState("ShortCodes");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "shortCodes",
          label: "ShortCodes",
          link: "/shortCodes",
          parentId: "shortCode",
        },
      ],
    },
    {
      id: "banners",
      label: "Banners",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isBanners,
      click: function (e) {
        e.preventDefault();
        setBanners(!isBanners);
        setIscurrentState("Banners");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "banners",
          label: "Banners",
          link: "/banners",
          parentId: "banner",
        },
      ],
    },
    {
      id: "schemas",
      label: "Schemas",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isSchema,
      click: function (e) {
        e.preventDefault();
        setIsSchema(!isSchema);
        setIscurrentState("Schemas");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "schemas",
          label: "Schemas",
          link: "/schemas",
          parentId: "schemas",
        },
      ],
    },
    {
      id: "authentications",
      label: "Authentications",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isAuthentications,
      click: function (e) {
        e.preventDefault();
        setAuthentications(!isAuthentications);
        setIscurrentState("Authentications");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "users",
          label: "Users",
          link: "/users",
          parentId: "user",
        },
        {
          id: "roles",
          label: "Roles",
          link: "/roles",
          parentId: "role",
        },
        {
          id: "actions",
          label: "Actions",
          link: "/actions",
          parentId: "action",
        },

        {
          id: "roleActions",
          label: "RoleActions",
          link: "/roleActions",
          parentId: "roleAction",
        },
      ],
    },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
