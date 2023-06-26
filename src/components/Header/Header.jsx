import React, { useRef, useEffect } from "react";
import "./header.css";
import { Container } from "reactstrap";

import { useGlobalState, truncate } from '../../store'
import { connectWallet } from '../../Blockchain.Services'
import { NavLink } from "react-router-dom";
import logoo from "../../assets/images/logo.svg";


const Header = () => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const NAV__LINKS = [
    {
      display: "Главная",
      url: "/home",
    },
    {
      display: "Торговая площадка",
      url: "/market",
    },
    {
      display: "Создать",
      url: "/create",
    },
    {
      display: "Мои картины",
      url: `/user/${connectedAccount}`,
    },
    {
      display: "Инструкция",
      url: "/Help",
    },
  ];
  useEffect(() => {
    const handleScroll = () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.className = "header header__shrink";
      } else {
        headerRef.current.className = "header";
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  const toggleMenu = () => {
    const menuClassName = menuRef.current.className;
    menuRef.current.className = menuClassName.includes("active__menu")
      ? menuClassName.replace("active__menu", "")
      : `${menuClassName} active__menu`;
  };


  return (
    <header className="header" ref={headerRef}>
      <Container>
        <div className="navigation">
          <div className="logo">
            <h2 className=" d-flex gap-2 align-items-center ">
             
                <img
                  src={logoo}
                  alt="logo"
                  className="logo"
                />
               <span>
               uniVision</span>
            </h2>
          </div>

          <div className="nav__menu" ref={menuRef} onClick={toggleMenu}>
            <ul className="nav__list">
              {NAV__LINKS.map((item, index) => (
                <li className="nav__item" key={index}>
                  <NavLink
                    to={item.url}
                    className={(navclassName) =>
                      navclassName.isActive ? "active" : ""
                    }
                  >
                    {item.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav__right d-flex align-items-center gap-5 ">
            {connectedAccount ? (
              <button
                className="btn d-flex gap-2 align-items-center">
                <div className="logo"> <h4>
                  {truncate(connectedAccount, 4, 4, 11)}
                </h4>
                </div>
              </button>
            ) : (
              <button className="btn d-flex gap-2 align-items-center"
                onClick={connectWallet} >
                <span>
                  <i className="ri-wallet-line"></i>
                </span>
                <div className="logo">
                  <h4>Connect Wallet</h4>
                </div>
              </button>
            )}

            <span className="mobile__menu">
              <i className="ri-menu-line" onClick={toggleMenu}></i>
            </span>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
