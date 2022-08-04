import React from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

import { AppSidebarNav } from "./AppSidebarNav";

import { logoNegative } from "src/assets/brand/logo-negative";
import { sygnet } from "src/assets/brand/sygnet";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

// sidebar nav config
import navigation from "../_nav";
import mhsNav from "../_mhsNav";
import dosenNav from "../_dosenNav";
import { cilBell } from "@coreui/icons";
import { useAuthenticated } from "src/store/index";

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const [authenticated, setAuthenticated] = useAuthenticated();
  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      className="cs-bg-dark"
      onVisibleChange={(visible) => {
        dispatch({ type: "set", sidebarShow: visible });
      }}
    >
      <CSidebarBrand className="d-none px-3 d-md-flex" to="/">
        <div className="d-flex mt-3">
          <CIcon className="sidebar-brand-full" icon={cilBell} height={32} />
          <p className="fs-5 montserrat">We-App</p>
        </div>
        <CIcon className="sidebar-brand-narrow" icon={sygnet} height={35} />
      </CSidebarBrand>
      <CSidebarNav>
        <SimpleBar>
          {authenticated && authenticated.user.status === "admin" ? (
            <AppSidebarNav items={navigation} />
          ) : authenticated.user.status === "dosen" ? (
            <AppSidebarNav items={dosenNav} />
          ) : (
            <AppSidebarNav items={mhsNav} />
          )}
        </SimpleBar>
      </CSidebarNav>
      <CSidebarToggler
        className="d-none d-lg-flex"
        onClick={() =>
          dispatch({ type: "set", sidebarUnfoldable: !unfoldable })
        }
      />
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
