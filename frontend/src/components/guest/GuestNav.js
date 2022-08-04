import React from "react";
import { CContainer, CNavbar, CNavbarBrand } from "@coreui/react";
import GradientButton from "./GradientButton";
import { Link } from "react-router-dom";
import { useAuthenticated } from "src/store/index";

const GuestNav = () => {
  const [authenticated, setAuthenticated] = useAuthenticated();

  return (
    <>
      <CNavbar colorScheme="dark" className="py-4">
        <CContainer className="px-4 md-px-0">
          <CNavbarBrand href="#">We-App</CNavbarBrand>
          <Link to="/welcome" className="text-light">
            Home
          </Link>
          {authenticated.check ? (
            <GradientButton href="/dashboard">
              <div className="small">Dashboard</div>
            </GradientButton>
          ) : (
            <GradientButton href="/login">
              <div className="small">Sign In</div>
            </GradientButton>
          )}
        </CContainer>
      </CNavbar>
    </>
  );
};

export default GuestNav;
